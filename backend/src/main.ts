// main.ts — ponto de entrada da aplicação NestJS

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Segurança ────────────────────────────────────────────────────────────────

  // helmet adiciona headers HTTP de segurança em todas as respostas:
  // X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.
  // impede ataques como clickjacking, sniffing de MIME type e outros
  app.use(helmet());

  // habilita CORS para o frontend — local e qualquer deploy na Vercel
  app.enableCors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        origin === 'http://localhost:3001' ||
        /\.vercel\.app$/.test(origin) ||
        origin === process.env.FRONTEND_URL;
      callback(null, allowed ? origin : false);
    },
  });

  // ── Configuração global ──────────────────────────────────────────────────────

  // prefixo global para todas as rotas da API (ex: /api/auth/login)
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
  SwaggerModule.setup('docs', app, document); // Swagger disponível em /docs
  // ────────────────────────────────────────────────────────────────────────────

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
