import { Exclude, Type } from 'class-transformer';
import { LogFrom, LogType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Represents a log event that can be created.
 *
 * @class
 */
export class CreateLogEvent {
    @IsEnum(LogType)
    @Exclude({ toPlainOnly: true })
    type: LogType;

    @Exclude({ toPlainOnly: true })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    writeDatabase?: boolean;

    @IsEnum(LogFrom)
    from: LogFrom;

    @IsString()
    @Type(() => String)
    eventName: string;

    @IsString()
    @Type(() => String)
    serviceName: string;

    @IsString()
    @IsOptional()
    @Type(() => String)
    description?: string;

    @IsOptional()
    message?: any;

    @IsOptional()
    errorCode?: any;

    @IsOptional()
    stack?: any;

    @IsOptional()
    context?: any;

    constructor(data: CreateLogEvent) {
        Object.assign(this, {
            ...data,
            writeDatabase: data?.writeDatabase ?? true,
        });
    }
}
