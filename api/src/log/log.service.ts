import { Injectable } from '@nestjs/common';
import { CreateOneLogArgs, FindManyLogArgs, FindUniqueLogOrThrowArgs, Log } from '../@generated/log';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateLogEvent } from '../events/create-log.event';
import { GraphQLError } from 'graphql/error';
import { transformAndValidate } from 'class-transformer-validator';

@Injectable()
export class LogService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    /**
     * Creates a new log entry.
     *
     * @param {CreateOneLogArgs} createOneLogArgs - The arguments for creating a new log entry.
     * @return {Promise<Log>} - A Promise that resolves to the created log entry.
     */
    async create(createOneLogArgs: CreateOneLogArgs): Promise<Log> {
        if (createOneLogArgs?.data?.data) {
            try {
                await transformAndValidate(CreateLogEvent, createOneLogArgs.data.data);
            } catch (error) {
                console.log(error);
                throw new GraphQLError('Data must be instance of CreateLogEvent', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        argumentName: 'data',
                        stacktrace: error,
                    },
                });
            }
        }

        return this.prismaService.log.create({
            data: createOneLogArgs.data,
        });
    }

    /**
     * Returns an array of logs that match the given query parameters.
     *
     * @param {FindManyLogArgs} findManyLogArgs - The query parameters used to filter the logs.
     * @returns {Promise<Log[]>} An array of logs that match the query parameters.
     */
    async findAll(findManyLogArgs: FindManyLogArgs): Promise<Log[]> {
        return this.prismaService.log.findMany({
            where: findManyLogArgs.where,
            cursor: findManyLogArgs.cursor,
            distinct: findManyLogArgs.distinct,
            take: findManyLogArgs.take,
            orderBy: findManyLogArgs.orderBy,
            skip: findManyLogArgs.skip,
        });
    }

    /**
     * Finds a single log entry based on the provided arguments.
     *
     * @param {FindUniqueLogOrThrowArgs} findUniqueLogOrThrowArgs - The arguments used to find the log entry.
     * @returns {Promise<Log>} - A promise that resolves to the requested log entry.
     */
    async findUnique(findUniqueLogOrThrowArgs: FindUniqueLogOrThrowArgs): Promise<Log> {
        return this.prismaService.log.findUniqueOrThrow({
            where: findUniqueLogOrThrowArgs.where,
        });
    }
}
