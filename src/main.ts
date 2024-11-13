declare const module: any;

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exception/exception.filter';
import { DataSource } from 'typeorm';
import { AuditSubscriber } from './common/subscriber/audit.subscriber';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'], // Ensure all log is activated
    });

    const PORT = 5000;

    const dataSource = app.get(DataSource);
    dataSource.setOptions({
        subscribers: [AuditSubscriber], // Thêm subscriber của bạn vào đây
    });

    // Enable global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            //whitelist: true, // Strip any properties not defined in the DTO
            // forbidNonWhitelisted: true, // Throw an error when non-whitelisted properties are passed
            transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
        }),
    );
    // Register global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Config Swagger
    const config = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('API documentation for the project')
        .setVersion('1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            'JWT-auth', // Custom name for security scheme
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Enable cors
    app.enableCors();

    await app.listen(PORT, () => {
        console.log('Start success with port: ' + PORT);
        console.log('Swagger in: ' + 'http://localhost:' + PORT + '/api/');
    });

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
