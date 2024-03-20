import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/prisma/prisma-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    await app.listen(4000);

    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().then((r) => console.log(r));
