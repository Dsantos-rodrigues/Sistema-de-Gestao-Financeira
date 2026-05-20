// patrimonio.controller.ts — rota HTTP de consulta de patrimônio consolidado

import { Controller, Get, Query, Request } from '@nestjs/common';
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

  // GET /api/patrimonio/relatorio — score financeiro + projeção patrimonial 5 anos
  @Get('relatorio')
  @ApiOperation({ summary: 'Score financeiro e projeção patrimonial' })
  @ApiResponse({ status: 200, description: 'Score, componentes e projeção de 5 anos (60 pontos mensais).' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  getRelatorio(@Request() req) {
    return this.patrimonioService.getRelatorio(req.user.id);
  }

  // GET /api/patrimonio/performance — retorna métricas e histórico dos últimos 12 meses
  @Get('performance')
  @ApiOperation({ summary: 'Performance histórica do portfólio vs CDI e Ibovespa' })
  @ApiResponse({ status: 200, description: 'YTD, melhor/pior mês, Sharpe e séries mensais.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  getPerformance(@Request() req) {
    return this.patrimonioService.getPerformance(req.user.id);
  }

  // GET /api/patrimonio/evolucao — retorna a evolução mensal do patrimônio
  // aceita ?assetType=STOCK para filtrar por tipo de ativo
  @Get('evolucao')
  @ApiOperation({ summary: 'Evolução mensal do patrimônio' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pontos mensais com aplicado (aportes) e ganho (lucro dos ativos).',
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  getEvolucao(@Request() req, @Query('assetType') assetType?: string) {
    return this.patrimonioService.getEvolucao(req.user.id, assetType);
  }
}
