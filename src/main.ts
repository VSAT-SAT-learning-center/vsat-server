declare const module: any;

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exception/exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'], // Ensure all log is activated
    });

    const PORT = 5000;

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
        .addBearerAuth() //Add auth if necessary
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    // Enable cors
    app.enableCors();

    await app.listen(PORT, () => {
        console.log('start success with port: ' + PORT);
        console.log('Swagger in: ' + 'http://localhost:' + PORT + '/api/v1/');
    });

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
