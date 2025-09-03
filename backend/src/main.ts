import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {

  console.log('🚀 Starting MDHH Backend...');
  console.log('📍 NODE_ENV:', process.env.NODE_ENV);
  console.log('📍 PORT:', process.env.PORT);
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' :
    '❌ Missing');
  console.log('📍 FRONTEND_URL:', process.env.FRONTEND_URL);
  const app = await NestFactory.create(AppModule);
  // Enable CORS for frontend - environment based
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000'];
  console.log('📍 CORS Origins:', allowedOrigins);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe with transformation enabled
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('MDHH API')
    .setDescription('Full-stack application API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
