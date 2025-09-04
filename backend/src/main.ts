import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Starting MDHH Backend...');
  console.log('📍 NODE_ENV:', process.env.NODE_ENV);
  console.log('📍 PORT:', process.env.PORT);
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('📍 FRONTEND_URL:', process.env.FRONTEND_URL);

  const app = await NestFactory.create(AppModule);

  // CORS configuration based on NODE_ENV
  let allowedOrigins;
  switch (process.env.NODE_ENV) {
    case 'production':
      allowedOrigins = ['https://mdhh.vercel.app',
        'https://mdhh-iwdk0o3sa-dkerens-projects.vercel.app', // Main project URL
        'https://mdhh-git-develope-dkerens-projects.vercel.app' // Branch-specific URL
      ];
      break;
    case 'preview':
    case 'development':
      allowedOrigins = [
        'https://mdhh-iwdk0o3sa-dkerens-projects.vercel.app', // Main project URL
        'https://mdhh-git-develope-dkerens-projects.vercel.app' // Branch-specific URL
      ];
      break;
    default:
      allowedOrigins = ['http://localhost:3000'];
      break;
  }

  console.log('📍 CORS Origins:', allowedOrigins);

  // Add request logging middleware BEFORE CORS
  app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'NO_ORIGIN'} - User-Agent: ${req.headers['user-agent'] || 'NO_UA'}`);
    next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      console.log('🔍 CORS Check - Origin:', origin || 'NO_ORIGIN');
      // Allow requests with no origin (health checks, curl, etc.)
      if (!origin) {
        console.log('✅ CORS: Allowing request with no origin');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log('✅ CORS: Allowing whitelisted origin:', origin);
        return callback(null, true);
      }
      console.log('❌ CORS: Blocking origin:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Global validation pipe
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
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  await app.listen(port, host);

  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log(`📚 API Docs: http://${host}:${port}/api/docs`);
}
bootstrap();
