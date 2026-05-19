// wallets.module.ts — agrupa tudo relacionado às carteiras financeiras

import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  controllers: [WalletsController], // rotas POST e GET /api/wallets
  providers: [WalletsService], // lógica de negócio das carteiras
})
export class WalletsModule {}
