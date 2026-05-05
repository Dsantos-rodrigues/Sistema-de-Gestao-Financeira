// app.module.ts — módulo raiz da aplicação NestJS
// Aqui registramos todos os módulos que compõem o sistema

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { PatrimonioModule } from './patrimonio/patrimonio.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // carrega o .env em toda a aplicação
    PrismaModule,        // conexão com o banco — disponível globalmente
    AuthModule,          // /api/auth/register e /api/auth/login
    TransactionsModule,  // /api/transactions
    WalletsModule,       // /api/wallets
    AssetsModule,        // /api/assets
    PatrimonioModule,    // /api/patrimonio

    // rate limiting global — limita cada IP a 20 requisições por minuto
    // protege contra força bruta em login e flood de requisições
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD, // guard global JWT — protege todas as rotas
      useClass: JwtGuard, // rotas públicas precisam de @Public()
    },
    {
      provide: APP_GUARD, // guard global de rate limiting — aplicado após o JWT
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
