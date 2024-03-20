import { ArgumentsHost, Catch, InternalServerErrorException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements GqlExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        switch (exception.code) {
            case 'P1017': {
                throw new InternalServerErrorException('Database has closed the connection.');
            }
            // case 'P2025': {
            //     throw new InternalServerErrorException(exception?.meta?.cause ?? 'Record to update not found.');
            // }
            default:
                break;
        }
        return exception;
    }
}
