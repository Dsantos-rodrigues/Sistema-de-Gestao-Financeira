// patrimonio.controller.ts — rota HTTP de consulta de patrimônio consolidado

import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PatrimonioService } from './patrimonio.service';

@ApiTags('Patrimônio') // agrupa a rota sob a tag "Patrimônio" no Swagger
@ApiBearerAuth('JWT') // indica que a rota exige token JWT
@Controller('patrimonio')
export class PatrimonioController {
  constructor(private readonly patrimonioService: PatrimonioService) {}

  // GET /api/patrimonio — retorna o patrimônio consolidado do usuário logado
  @Get()
  @ApiOperation({ summary: 'Consultar patrimônio consolidado' })
  @ApiResponse({
    status: 200,
    description:
      'Retorna patrimonioTotal, resumo de carteiras, ativos (com lucro/prejuízo) e transações.',
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  getPatrimonio(@Request() req) {
    return this.patrimonioService.getPatrimonio(req.user.id);
  }
}
