declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/exception/exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = 5000;

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip any properties not defined in the DTO
      forbidNonWhitelisted: true, // Throw an error when non-whitelisted properties are passed
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
    .addBearerAuth()  // Thêm auth nếu cần
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);  

  await app.listen(PORT, () => {
    console.log("start success with port: " + PORT);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
