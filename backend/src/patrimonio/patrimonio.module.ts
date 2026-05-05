// patrimonio.module.ts — agrupa tudo relacionado à consulta de patrimônio

import { Module } from '@nestjs/common';
import { PatrimonioController } from './patrimonio.controller';
import { PatrimonioService } from './patrimonio.service';

@Module({
  controllers: [PatrimonioController], // rota GET /api/patrimonio
  providers: [PatrimonioService], // lógica de cálculo do patrimônio
})
export class PatrimonioModule {}
