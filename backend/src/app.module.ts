// app.module.ts — módulo raiz da aplicação NestJS
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { AssetsModule } from './assets/assets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PatrimonioModule } from './patrimonio/patrimonio.module';

/**
 * Módulo raiz da aplicação.
 * Centraliza a configuração global de banco de dados (Prisma) e módulos de negócio.
 */
@Module({
  imports: [
    // Carrega as variáveis de ambiente do .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexão com o banco via Prisma (disponível globalmente)
    PrismaModule,

    // Módulos de negócio da aplicação (Versão Prisma / Inglês)
    AuthModule,
    UsersModule,
    WalletsModule,
    AssetsModule,
    TransactionsModule,
    PatrimonioModule,

    // Rate limiting global — limita cada IP a 20 requisições por minuto
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD, // Guard global JWT — protege todas as rotas por padrão
      useClass: JwtGuard, // Para liberar rotas específicas, use o decorator @Public()
    },
    {
      provide: APP_GUARD, // Guard global de rate limiting — aplicado após o JWT
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}