// transactions.controller.ts — rotas HTTP de transações financeiras

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transações')
@ApiBearerAuth('JWT')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // POST /api/transactions — cadastra nova transação
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Cadastrar nova transação' })
  @ApiResponse({ status: 201, description: 'Transação criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Request() req, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, dto);
  }

  // GET /api/transactions — lista todas as transações do usuário
  @Get()
  @ApiOperation({ summary: 'Listar todas as transações do usuário' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll(@Request() req) {
    return this.transactionsService.findAll(req.user.id);
  }

  // PATCH /api/transactions/:id — edita uma transação existente
  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Editar uma transação' })
  @ApiParam({ name: 'id', description: 'UUID da transação' })
  @ApiResponse({ status: 200, description: 'Transação atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(req.user.id, id, dto);
  }

  // DELETE /api/transactions/:id — remove uma transação
  @Delete(':id')
  @HttpCode(204) // retorna 204 No Content ao deletar com sucesso
  @ApiOperation({ summary: 'Deletar uma transação' })
  @ApiParam({ name: 'id', description: 'UUID da transação' })
  @ApiResponse({ status: 204, description: 'Transação deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  remove(@Request() req, @Param('id') id: string) {
    return this.transactionsService.remove(req.user.id, id);
  }
}
