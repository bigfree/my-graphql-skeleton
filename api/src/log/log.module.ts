import { Logger, Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogResolver } from './log.resolver';
import { LogListener } from './listeners/log.listener';
import { PrismaService } from '../common/prisma/prisma.service';
import { PubSubModule } from '../common/pubsub/pubsub.module';
import { JwtStrategy } from '../authorize/strategy/jwt.strategy';

@Module({
    imports: [PubSubModule],
    providers: [LogResolver, LogService, LogListener, PrismaService, Logger, JwtStrategy],
})
export class LogModule {}
