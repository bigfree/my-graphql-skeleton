import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginInput } from './dto/login.input';
import { LogFrom, LogType, Prisma, UserType } from '@prisma/client';
import { Authorize } from './entities/authorize.entity';
import { CreateLogEvent } from '../events/create-log.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenData } from './types/authorize.types';
import { RegisterInput } from './dto/register.input';
import { UserPasswordService } from '../common/services/user-password/user-password.service';
import { UserRoleService } from '../common/services/user-role/user-role.service';
import { User } from '../@generated/user';

@Injectable()
export class AuthorizeService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly jwtService: JwtService,
        private readonly userPasswordService: UserPasswordService,
        private readonly userRoleService: UserRoleService,
    ) {}

    /**
     * Logs in a user with the given login input.
     *
     * @param {LoginInput} loginInput - The login input containing the email and password of the user.
     * @returns {Promise<Authorize | null>} - A promise that resolves to an object containing an access token and the user information, or null if the login is unsuccessful.
     * @throws {UnauthorizedException} - Throws an UnauthorizedException if the email does not exist or the password is incorrect.
     */
    public login = async (loginInput: LoginInput): Promise<Authorize> => {
        const logData: CreateLogEvent = {
            type: LogType.LOG,
            from: LogFrom.API,
            eventName: 'login',
            serviceName: AuthorizeService.name,
        };

        /** Asynchronously fetches a user by their email.*/
        const user = await this.fetchUserByEmail(loginInput.email);

        /** Validates if the provided password is valid. */
        const isPasswordValid = await this.userPasswordService.comparePassword(
            loginInput.password,
            user?.password?.password ?? '',
        );

        if (null === user || false === isPasswordValid) {
            this.eventEmitter.emit(
                'create.log',
                new CreateLogEvent({
                    ...logData,
                    type: LogType.ERROR,
                    message: 'Unauthorized',
                    context: {
                        email: loginInput.email,
                        userId: user?.id ?? null,
                        isPasswordValid,
                    },
                }),
            );
            throw new UnauthorizedException();
        }

        return {
            accessToken: await this.generateJWT({
                id: user.id,
                email: user.email,
                type: user.type,
                role: user.role,
            }),
            user,
        };
    };

    /**
     * Registers a new user.
     *
     * @param {RegisterInput} registerInput - The input data for creating the user.
     * @return {Promise<Authorize>} - An object containing the access token and the created user.
     * @throws {Error} - If the user already exists.
     */
    public register = async (registerInput: RegisterInput): Promise<Authorize> => {
        const logData: CreateLogEvent = {
            type: LogType.LOG,
            from: LogFrom.API,
            eventName: 'register',
            serviceName: AuthorizeService.name,
        };

        const existingUser = await this.prismaService.user.findUnique({
            where: { email: registerInput.email },
        });

        if (existingUser) {
            this.eventEmitter.emit(
                'create.log',
                new CreateLogEvent({
                    ...logData,
                    type: LogType.ERROR,
                    message: 'User already exists',
                    context: {
                        email: registerInput.email,
                    },
                }),
            );
            throw new Error('User already exists');
        }

        const createdUser = await this.prismaService.user.create({
            include: {
                password: true,
                profile: true,
            },
            data: {
                ...registerInput,
                role: this.userRoleService.createByType(UserType.USER),
                password: {
                    create: {
                        password: await this.userPasswordService.hashPassword(registerInput.password),
                    },
                },
            },
        });

        return {
            accessToken: await this.generateJWT({
                id: createdUser.id,
                email: createdUser.email,
                type: createdUser.type,
                role: createdUser.role,
            }),
            user: createdUser,
        };
    };

    /**
     * Logout method
     *
     * @param {JwtTokenData} jwtTokenData The JSON web token data for the logged-in user
     * @return {Promise<Object>} A promise that resolves to an object containing the access token and user details
     */
    public async logout(jwtTokenData: JwtTokenData): Promise<User> {
        // TODO: add custom logout logic

        return this.prismaService.user.findUniqueOrThrow({
            include: {
                profile: true,
            },
            where: {
                id: jwtTokenData.id,
                email: jwtTokenData.email,
            },
        });
    }

    /**
     * Retrieves a user from the database based on their email address.
     *
     * @param {string} email - The email address of the user.
     * @returns {Promise<User | null>} - A promise that resolves to a User object if found, or null if not found.
     * @private
     */
    private fetchUserByEmail = async (
        email: string,
    ): Promise<Prisma.UserGetPayload<{
        include: { password: true; profile: true };
    }> | null> =>
        this.prismaService.user.findUnique({
            include: {
                password: true,
                profile: true,
            },
            where: {
                email,
            },
        });

    /**
     * Generates a JWT (JSON Web Token) using the provided data.
     *
     * @param {JwtTokenData} data - The token data to be signed.
     * @returns {Promise<string>} - A Promise that resolves to the generated JWT as a string.
     */
    private generateJWT = async (data: JwtTokenData): Promise<string> => {
        return await this.jwtService.signAsync(data);
    };
}
