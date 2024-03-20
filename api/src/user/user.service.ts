import { Injectable } from '@nestjs/common';
import {
    CreateOneUserArgs,
    DeleteOneUserArgs,
    FindManyUserArgs,
    FindUniqueUserArgs,
    UpdateOneUserArgs,
    User,
} from '../@generated/user';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateLogEvent } from '../events/create-log.event';
import { LogFrom, LogType, UserRole, UserType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserPasswordService } from '../common/services/user-password/user-password.service';
import { UserRoleService } from '../common/services/user-role/user-role.service';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly userPasswordService: UserPasswordService,
        private readonly userRoleService: UserRoleService,
    ) {}

    /**
     * Finds a unique user based on the provided arguments.
     *
     * @param {FindUniqueUserArgs} findUniqueUserArgs - The arguments to find the unique user.
     * @returns {Promise<User | null>} - A promise resolving to the unique user found, or null if not found.
     */
    public async findUnique(findUniqueUserArgs: FindUniqueUserArgs): Promise<User | null> {
        return this.prismaService.user.findUniqueOrThrow({
            include: {
                profile: true,
            },
            ...findUniqueUserArgs,
        });
    }

    /**
     * Finds multiple users based on the given arguments.
     *
     * @param {FindManyUserArgs} findManyUserArgs - The arguments to filter and search for users.
     * @returns {Promise<User[]>} - A promise that resolves to an array of User objects.
     */
    public async findMany(findManyUserArgs: FindManyUserArgs): Promise<User[]> {
        return this.prismaService.user.findMany({
            include: {
                profile: true,
            },
            ...findManyUserArgs,
        });
    }

    /**
     * Create a new user with the given arguments.
     *
     * @param {CreateOneUserArgs} createOneUserArgs - The arguments for creating a new user.
     * @return {Promise<User>} - A promise that resolves with the created User object.
     */
    public async createOne(createOneUserArgs: CreateOneUserArgs): Promise<User> {
        const logData: CreateLogEvent = {
            type: LogType.LOG,
            from: LogFrom.API,
            eventName: 'createOne',
            serviceName: UserService.name,
        };

        const existingUser = await this.prismaService.user.findUnique({
            where: {
                email: createOneUserArgs.data.email,
            },
        });

        if (existingUser) {
            this.eventEmitter.emit(
                'create.log',
                new CreateLogEvent({
                    ...logData,
                    type: LogType.ERROR,
                    message: 'User already exists',
                    context: {
                        email: createOneUserArgs.data.email,
                    },
                }),
            );
            throw new Error('User already exists');
        }

        if (!createOneUserArgs.data.role) {
            createOneUserArgs.data.role = {
                set: this.userRoleService.createByType(createOneUserArgs.data.type),
            };
        }

        return this.prismaService.user.create({
            include: {
                profile: true,
            },
            ...createOneUserArgs,
            data: {
                ...createOneUserArgs.data,
                password: {
                    create: {
                        password: await this.userPasswordService.hashPassword(
                            createOneUserArgs.data.password.create.password,
                        ),
                    },
                },
            },
        });
    }

    /**
     * Updates a user and their profile information based on the provided arguments.
     *
     * @param {UpdateOneUserArgs} updateOneUserArgs - The arguments for updating the user and profile information.
     * @return {Promise<User>} - A promise that resolves to the updated User object, including the updated Profile information.
     */
    public async updateOne(updateOneUserArgs: UpdateOneUserArgs): Promise<User> {
        await this.prismaService.user.findUniqueOrThrow({
            where: updateOneUserArgs.where,
        });

        if (updateOneUserArgs.data.type.set && !updateOneUserArgs.data.role) {
            updateOneUserArgs.data.role = {
                set: this.userRoleService.createByType(updateOneUserArgs.data.type.set),
            };
        }

        // https://github.com/prisma/prisma/issues/10142
        return this.prismaService.user.update({
            include: {
                profile: true,
            },
            ...updateOneUserArgs,
        });
    }

    /**
     * Deletes a single user from the database.
     *
     * @param {DeleteOneUserArgs} deleteOneUserArgs - The arguments for deleting the user.
     * @returns {Promise<User>} - A promise that resolves to the deleted user.
     */
    public async deleteOne(deleteOneUserArgs: DeleteOneUserArgs): Promise<User> {
        await this.prismaService.user.findUniqueOrThrow({
            where: deleteOneUserArgs.where,
        });

        return this.prismaService.user.delete({
            include: {
                profile: true,
            },
            ...deleteOneUserArgs,
        });
    }
}
