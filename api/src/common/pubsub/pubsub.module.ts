import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Module({
    providers: [
        {
            provide: PubSub,
            useFactory: async () => {
                return new PubSub();
            },
        },
    ],
    exports: [PubSub],
})
export class PubSubModule {}
