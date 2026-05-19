import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CarteirasService } from './carteiras.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
}