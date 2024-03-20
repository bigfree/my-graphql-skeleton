import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateLogEvent } from '../../events/create-log.event';
import { PrismaService } from '../../common/prisma/prisma.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class LogListener {
    constructor(
        private readonly logger: Logger,
        private readonly prismaService: PrismaService,
    ) {}

    @OnEvent('create.log')
    async handleLogEvent(eventData: CreateLogEvent) {
        const serialized = instanceToPlain(eventData);
        const methodName = eventData.type.toLowerCase();

        if (typeof this.logger[methodName] !== 'function') {
            throw new Error(`Invalid event type: ${eventData.type}`);
        }

        this.logger[methodName](serialized);

        if (eventData.writeDatabase) {
            await this.prismaService.log.create({
                data: {
                    type: eventData.type,
                    from: eventData.from,
                    data: serialized,
                },
            });
        }
    }
}
