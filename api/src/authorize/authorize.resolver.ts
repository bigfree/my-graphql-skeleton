import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { AuthorizeService } from './authorize.service';
import { Authorize } from './entities/authorize.entity';
import { LoginInput } from './dto/login.input';
import { UseGuards } from '@nestjs/common';
import { GqlThrottlerGuard } from '../common/guards/gql-throttle.guard';
import { RegisterInput } from './dto/register.input';
import { User } from '../@generated/user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtTokenData } from './types/authorize.types';
import { PublishStateEnum } from '../common/pubsub/publish-state.enum';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Resolver(() => Authorize)
export class AuthorizeResolver {
    /**
     * Creates a new instance of the class.
     *
     * @param {AuthorizeService} authorizeService - The authorize service object.
     * @param {PubSub} pubSub - The pub/sub object.
     */
    constructor(
        private readonly authorizeService: AuthorizeService,
        private readonly pubSub: PubSub,
    ) {}

    /**
     * Authenticates a user with the provided login credentials.
     *
     * @param {LoginInput} loginInput - The login credentials of the user.
     * @returns {Promise<Authorize>} - A promise that resolves to an object containing the authorization token and user information.
     */
    @UseGuards(GqlThrottlerGuard)
    @Mutation(() => Authorize)
    async login(@Args('loginInput') loginInput: LoginInput): Promise<Authorize> {
        return await this.authorizeService.login(loginInput);
    }

    /**
     * Registers a user.
     *
     * @param {RegisterInput} registerInput - The input data for registration.
     * @return {Promise<Authorize>} - A promise that resolves to an instance of Authorize.
     */
    @UseGuards(GqlThrottlerGuard)
    @Mutation(() => Authorize)
    async register(@Args('registerInput') registerInput: RegisterInput): Promise<Authorize> {
        return await this.authorizeService.register(registerInput);
    }

    /**
     * Logout method
     *
     * This method is used to log out a user by invalidating their JWT token.
     *
     * @param {JwtTokenData} jwtTokenData - The decoded JWT token data of the user.
     * @return {Promise<User | null>} - Returns a Promise that resolves to the logged out user or null if the logout fails.
     */
    @UseGuards(JwtAuthGuard, GqlThrottlerGuard)
    @Mutation(() => User)
    public async logout(@CurrentUser() jwtTokenData: JwtTokenData): Promise<User | null> {
        const user = await this.authorizeService.logout(jwtTokenData);

        await this.pubSub.publish(PublishStateEnum.USER_LOGOUT, {
            [PublishStateEnum.USER_LOGOUT]: user,
        });

        return user;
    }

    /**
     * Logout Authorization
     *
     * This method logs out the user's authorization by returning an async iterator for the AUTHORIZATION_LOGOUT event.
     *
     * @returns {Promise<AsyncIterator<User>>} - An async iterator that emits User objects for every AUTHORIZATION_LOGOUT event.
     */
    @UseGuards(JwtAuthGuard)
    @Subscription(() => User, { name: PublishStateEnum.USER_LOGOUT })
    public async logoutAuthorization(): Promise<AsyncIterator<User>> {
        return this.pubSub.asyncIterator(PublishStateEnum.USER_LOGOUT);
    }
}
