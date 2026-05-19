import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { CarteirasService } from './carteiras.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FiltroAgregacaoDto } from './dto/filtro-agregacao.dto';

/**
 * Controller responsável pelas rotas de carteiras e patrimônio.
 * Todas as rotas são protegidas pelo JwtAuthGuard.
 */
@Controller('carteiras')
@UseGuards(JwtAuthGuard) // protege todas as rotas deste controller
export class CarteirasController {
  constructor(
    private readonly carteirasService: CarteirasService,
  ) {}

  /**
   * Lista todas as carteiras do usuário autenticado.
   * GET /carteiras
   * @param req - Request com usuário autenticado injetado pelo JWT
   * @returns Lista de carteiras do usuário
   */
  @Get()
  async listar(@Request() req) {
    return this.carteirasService.listarCarteiras(req.user.id);
  }

  /**
   * Consulta o patrimônio completo do usuário.
   * GET /carteiras/patrimonio
   * @param req - Request com usuário autenticado injetado pelo JWT
   * @returns Carteiras com saldos e saldo total geral
   */
  @Get('patrimonio')
  async patrimonio(@Request() req) {
    return this.carteirasService.consultarPatrimonio(req.user.id);
  }

  /**
   * Retorna o saldo total do usuário.
   * GET /carteiras/saldo
   * @param req - Request com usuário autenticado injetado pelo JWT
   * @returns Saldo total somando todas as carteiras
   */
  @Get('saldo')
  async saldo(@Request() req) {
    return this.carteirasService.calcularSaldoTotal(req.user.id);
  }

  /**
   * Retorna agregações financeiras do usuário.
   * GET /carteiras/agregacoes
   * Aceita filtros opcionais: ?data_inicio=2026-01-01&data_fim=2026-12-31&carteira_id=uuid
   * @param req - Request com usuário autenticado injetado pelo JWT
   * @param filtro - Filtros opcionais de período e carteira
   * @returns Resumo financeiro com totais por tipo e categoria
   */
  @Get('agregacoes')
  async agregacoes(@Request() req, @Query() filtro: FiltroAgregacaoDto) {
    return this.carteirasService.gerarAgregacoes(req.user.id, filtro);
  }
}
