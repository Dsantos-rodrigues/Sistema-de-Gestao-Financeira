// app.module.ts — módulo raiz da aplicação NestJS
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { MarketModule } from './market/market.module';
import { PatrimonioModule } from './patrimonio/patrimonio.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    // Carrega as variáveis de ambiente do .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexão com o banco via Prisma (único ORM ativo)
    PrismaModule,

    // Módulos da aplicação
    AuthModule,          // /api/auth/register e /api/auth/login
    TransactionsModule,  // /api/transactions
    WalletsModule,       // /api/wallets
    AssetsModule,        // /api/assets
    PatrimonioModule,    // /api/patrimonio
    MarketModule,        // /api/market

    // Rate limiting: 20 requisições por minuto por IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard, // JWT global — rotas públicas precisam de @Public()
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
