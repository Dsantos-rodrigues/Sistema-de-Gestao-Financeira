import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { TransacoesService } from './transacoes.service';
import { CriarTransacaoDto } from './dto/criar-transacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller responsável pelas rotas de transações financeiras.
 * Todas as rotas são protegidas pelo JwtAuthGuard.
 */
@Controller('transacoes')
@UseGuards(JwtAuthGuard) // protege todas as rotas deste controller
export class TransacoesController {
  constructor(
    private readonly transacoesService: TransacoesService,
  ) {}

  /**
   * Cadastra uma nova transação financeira.
   * POST /transacoes
   * @param req - Request com usuário autenticado injetado pelo JWT
   * @param dto - Dados da transação
   * @returns A transação criada
   */
  @Post()
  async criar(@Request() req, @Body() dto: CriarTransacaoDto) {
    return this.transacoesService.criar(req.user.id, dto);
  }

  /**
   * Lista todas as transações do usuário autenticado.
   * GET /transacoes
   * @param req - Request com usuário autenticado injetado pelo JWT
   * @returns Lista de transações
   */
  @Get()
  async listar(@Request() req) {
    return this.transacoesService.listar(req.user.id);
  }
}