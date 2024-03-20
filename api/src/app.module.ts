import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from './common/prisma/prisma.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { LogModule } from './log/log.module';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { UserModule } from './user/user.module';
import { AuthorizeModule } from './authorize/authorize.module';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { UserPasswordService } from './common/services/user-password/user-password.service';
import { UserRoleService } from './common/services/user-role/user-role.service';
import Redis from 'ioredis';

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        ThrottlerModule.forRoot({
            storage: new ThrottlerStorageRedisService(
                new Redis({
                    host: 'redis',
                    port: 6379,
                }),
            ),
            throttlers: [
                {
                    name: 'short',
                    ttl: seconds(1),
                    limit: 3,
                },
                {
                    name: 'medium',
                    ttl: seconds(10),
                    limit: 20,
                },
                {
                    name: 'long',
                    ttl: seconds(60),
                    limit: 100,
                },
            ],
        }),
        WinstonModule.forRoot({
            transports: [
                new winston.transports.DailyRotateFile({
                    filename: 'logs/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                }),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.ms(),
                        nestWinstonModuleUtilities.format.nestLike('Nest', {
                            colors: true,
                            prettyPrint: true,
                        }),
                    ),
                }),
                // other transports...
            ],
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: false,
            autoSchemaFile: join(process.cwd(), 'schema.gql'),
            sortSchema: true,
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
            subscriptions: {
                'graphql-ws': {
                    path: '/graphql',
                },
            },
            context: ({ req, res, connectionParams, extra }) => ({
                req,
                res,
                connectionParams,
                extra,
            }),
            buildSchemaOptions: {
                dateScalarMode: 'isoDate',
                // fieldMiddleware: [loggerMiddleware],
            },
            formatError: (error) => {
                const originalError = error.extensions?.originalError as Error;

                if (!originalError) {
                    return {
                        message: error.message,
                        code: error.extensions?.code,
                        stackTrace: error.extensions?.stacktrace,
                    };
                }

                return {
                    message: originalError.message,
                    code: error.extensions?.code,
                    stackTrace: error.extensions?.stacktrace,
                };
            },
        }),
        LogModule,
        UserModule,
        AuthorizeModule,
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService, UserPasswordService, UserRoleService],
})
export class AppModule {}
