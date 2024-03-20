import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
    CreateOneUserArgs,
    DeleteOneUserArgs,
    FindManyUserArgs,
    FindUniqueUserArgs,
    UpdateOneUserArgs,
    User,
} from '../@generated/user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtTokenData } from '../authorize/types/authorize.types';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { GqlThrottlerGuard } from '../common/guards/gql-throttle.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { PublishStateEnum } from '../common/pubsub/publish-state.enum';
import { PubSub } from 'graphql-subscriptions';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
    /**
     * Constructs a new instance of the class.
     *
     * @param {UserService} userService - The user service object to be injected.
     * @param pubSub
     */
    constructor(
        private readonly userService: UserService,
        private readonly pubSub: PubSub,
    ) {}

    /**
     * Returns the user associated with the JWT token data.
     *
     * @param {JwtTokenData} jwtTokenData - The JWT token data containing user identification information.
     * @returns {Promise<User | null>} - The user object if found, otherwise null.
     */
    @UseGuards(GqlThrottlerGuard)
    @SkipThrottle({ short: true })
    @Query(() => User, { name: 'me' })
    public async me(@CurrentUser() jwtTokenData: JwtTokenData): Promise<User | null> {
        return await this.userService.findUnique({
            where: {
                id: jwtTokenData.id,
                email: jwtTokenData.email,
            },
        });
    }

    /**
     * Finds a unique user based on the provided arguments.
     *
     * @param {FindUniqueUserArgs} findUniqueUserArgs - The arguments used to find the user.
     * @returns {Promise<User | null>} - A Promise that resolves to a User object if found, or null if not found.
     */
    @UseGuards(GqlThrottlerGuard, new RolesGuard([UserRole.ROLE_ADMIN]))
    @SkipThrottle({ short: true })
    @Query(() => User, { name: 'user' })
    public async findOne(@Args() findUniqueUserArgs: FindUniqueUserArgs): Promise<User | null> {
        return await this.userService.findUnique(findUniqueUserArgs);
    }

    /**
     * Retrieves all users based on the provided arguments.
     *
     * @param {FindManyUserArgs} findManyUserArgs - The arguments to filter or paginate the users.
     * @return {Promise<User[]>} - A promise that resolves to an array of User objects.
     */
    @UseGuards(GqlThrottlerGuard, new RolesGuard([UserRole.ROLE_USER]))
    @SkipThrottle({ short: true })
    @Query(() => [User], { name: 'users' })
    public async findAll(@Args() findManyUserArgs: FindManyUserArgs): Promise<User[]> {
        return await this.userService.findMany(findManyUserArgs);
    }

    /**
     * Creates a new user.
     *
     * @param {CreateOneUserArgs} createOneUserArgs - The arguments for creating a user.
     * @returns {Promise<User>} - A promise that resolves to the created user.
     */
    @UseGuards(GqlThrottlerGuard, new RolesGuard([UserRole.ROLE_ADMIN]))
    @SkipThrottle({ short: true })
    @Mutation(() => User)
    public async createUser(@Args() createOneUserArgs: CreateOneUserArgs): Promise<User> {
        const user = await this.userService.createOne(createOneUserArgs);

        await this.pubSub.publish(PublishStateEnum.USER_CREATED, {
            [PublishStateEnum.USER_CREATED]: user,
        });

        return user;
    }

    /**
     * Updates a user with the provided data.
     *
     * @param {UpdateOneUserArgs} updateOneUserArgs - The arguments for updating a user.
     * @returns {Promise<User>} - A promise that resolves to the updated user.
     */
    @UseGuards(GqlThrottlerGuard, new RolesGuard([UserRole.ROLE_ADMIN]))
    @SkipThrottle({ short: true })
    @Mutation(() => User)
    public async updateUser(@Args() updateOneUserArgs: UpdateOneUserArgs): Promise<User> {
        const user = await this.userService.updateOne(updateOneUserArgs);

        await this.pubSub.publish(PublishStateEnum.USER_UPDATED, {
            [PublishStateEnum.USER_UPDATED]: user,
        });

        return user;
    }

    /**
     * Delete a user.
     *
     * @param {DeleteOneUserArgs} deleteOneUserArgs - The arguments for deleting a user.
     * @return {Promise<User>} - The deleted user.
     */
    @UseGuards(GqlThrottlerGuard, new RolesGuard([UserRole.ROLE_ADMIN]))
    @SkipThrottle({ short: true })
    @Mutation(() => User)
    public async deleteUser(@Args() deleteOneUserArgs: DeleteOneUserArgs): Promise<User> {
        const user = await this.userService.deleteOne(deleteOneUserArgs);

        await this.pubSub.publish(PublishStateEnum.USER_DELETED, {
            [PublishStateEnum.USER_DELETED]: user,
        });

        return user;
    }

    /**
     * Method createdUser
     *
     * @returns {Promise<AsyncIterator<User>>} - Returns a promise that resolves to an asynchronous iterator of User objects.
     *
     * @description
     * This method is decorated with the `@UseGuards` decorator to ensure that only users with the `UserRole.ROLE_ADMIN` role can access it.
     * It is also decorated with the `@Subscription` decorator to indicate that it is a subscription event that will be triggered when a new user is created.
     */
    @UseGuards(new RolesGuard([UserRole.ROLE_ADMIN]))
    @Subscription(() => User, { name: PublishStateEnum.USER_CREATED })
    public async createdUser(): Promise<AsyncIterator<User>> {
        return this.pubSub.asyncIterator(PublishStateEnum.USER_CREATED);
    }

    /**
     * Returns an asynchronous iterator for subscribing to updates of a user object.
     * Requires the user to have the role ROLE_ADMIN for access.
     *
     * @returns {Promise<AsyncIterator<User>>} - An asynchronous iterator that emits updated user objects.
     */
    @UseGuards(new RolesGuard([UserRole.ROLE_ADMIN]))
    @Subscription(() => User, { name: PublishStateEnum.USER_UPDATED })
    public async updatedUser(): Promise<AsyncIterator<User>> {
        return this.pubSub.asyncIterator(PublishStateEnum.USER_UPDATED);
    }

    /**
     * Returns an `AsyncIterator` that emits events whenever a user is deleted.
     *
     * @returns {Promise<AsyncIterator<User>>} - An `AsyncIterator` that emits events of type `User`.
     */
    @UseGuards(new RolesGuard([UserRole.ROLE_ADMIN]))
    @Subscription(() => User, { name: PublishStateEnum.USER_DELETED })
    public async deletedUser(): Promise<AsyncIterator<User>> {
        return this.pubSub.asyncIterator(PublishStateEnum.USER_DELETED);
    }
}
