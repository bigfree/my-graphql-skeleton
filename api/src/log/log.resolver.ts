import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { LogService } from './log.service';
import { CreateOneLogArgs, FindManyLogArgs, FindUniqueLogOrThrowArgs, Log } from '../@generated/log';
import { PublishStateEnum } from '../common/pubsub/publish-state.enum';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Log)
export class LogResolver {
    constructor(
        private readonly logsService: LogService,
        private readonly pubSub: PubSub,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Mutation(() => Log)
    async createLog(@Args() createOneLogArgs: CreateOneLogArgs) {
        const log = await this.logsService.create(createOneLogArgs);

        await this.pubSub.publish(PublishStateEnum.LOG_CREATED, {
            [PublishStateEnum.LOG_CREATED]: log,
        });

        return log;
    }

    @UseGuards(JwtAuthGuard)
    @Query(() => [Log], { name: 'logs' })
    async findAll(@Args() findManyLogArgs: FindManyLogArgs) {
        return await this.logsService.findAll(findManyLogArgs);
    }

    @UseGuards(JwtAuthGuard)
    @Query(() => Log, { name: 'log' })
    async findOne(@Args() findUniqueLogOrThrowArgs: FindUniqueLogOrThrowArgs) {
        return this.logsService.findUnique(findUniqueLogOrThrowArgs);
    }

    @Subscription(() => Log, { name: PublishStateEnum.LOG_CREATED })
    async createdLog(): Promise<AsyncIterator<Log>> {
        return this.pubSub.asyncIterator(PublishStateEnum.LOG_CREATED);
    }
}
