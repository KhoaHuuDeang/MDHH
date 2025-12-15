import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://mdhh-git-develope-dkerens-projects.vercel.app',
        'https://mdhh.vercel.app'
      ]
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger only in development
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('MDHH API')
      .setDescription('Full-stack application API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Port binding - CRITICAL for Render
  const port = process.env.PORT || 10000;
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Attempting to bind to 0.0.0.0:${port}`);

  await app.listen(port, '0.0.0.0'); // Always bind to 0.0.0.0 for cloud hosting

  console.log(`✅ Server successfully bound to 0.0.0.0:${port}`);
  console.log(`🚀 Application is ready to accept connections`);
}

bootstrap();