declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/exception/exception.filter';

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
  

  await app.listen(PORT, () => {
    console.log("start success with port: " + PORT);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
