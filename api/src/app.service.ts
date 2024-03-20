import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateLogEvent } from './events/create-log.event';

@Injectable()
export class AppService {
    constructor(private readonly eventEmitter: EventEmitter2) {}

    getHello(): string {
        // const orderCreatedEvent = new CreateLogEvent();
        // orderCreatedEvent.name = 'Test order';
        // orderCreatedEvent.description = 'Test description';
        //
        // this.eventEmitter.emit('create.log', orderCreatedEvent);
        return 'Hello World!';
    }
}
