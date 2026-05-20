// main.ts — ponto de entrada da aplicação NestJS
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Segurança ────────────────────────────────────────────────────────────────
  
  // Em produção no Cloud Run, desativamos o CSP do helmet temporariamente se for usar o Swagger (/docs),
  // pois o helmet bloqueia os scripts inline que o Swagger usa para renderizar a página.
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? false : undefined,
    }),
  );

  // Habilita CORS flexível para produção, aceitando tanto o localhost quanto o futuro domínio da nuvem
  app.enableCors({
    origin: true, // Em produção, true permite que a API responda às requisições do front adequadamente
    credentials: true,
  });

  // ── Configuração global ──────────────────────────────────────────────────────
  
  // Garante que as validações dos seus DTOs (como o LoginDto que arrumamos) funcionem globalmente!
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos que não estão no DTO
      transform: true, // Converte tipos automaticamente
    }),
  );

  app.setGlobalPrefix('api');

  // ── Swagger ──────────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestão Financeira')
    .setDescription('Documentação completa da API do sistema financeiro')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // ── Inicialização do Servidor ───────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  
  // OBRIGATÓRIO PARA O DOCKER/CLOUD RUN: Escutar em '0.0.0.0'
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();