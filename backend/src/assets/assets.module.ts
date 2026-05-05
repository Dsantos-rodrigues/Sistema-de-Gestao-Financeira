// assets.module.ts — agrupa tudo relacionado aos ativos financeiros

import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  controllers: [AssetsController], // rotas POST e GET /api/assets
  providers: [AssetsService], // lógica de negócio dos ativos
})
export class AssetsModule {}
