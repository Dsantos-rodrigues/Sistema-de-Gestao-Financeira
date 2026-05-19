// wallets.controller.ts — rotas HTTP das carteiras financeiras

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
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletsService } from './wallets.service';

@ApiTags('Carteiras')
@ApiBearerAuth('JWT')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  // POST /api/wallets — cria nova carteira
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Criar nova carteira' })
  @ApiResponse({ status: 201, description: 'Carteira criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Request() req, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(req.user.id, dto);
  }

  // GET /api/wallets — lista todas as carteiras
  @Get()
  @ApiOperation({ summary: 'Listar todas as carteiras do usuário' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll(@Request() req) {
    return this.walletsService.findAll(req.user.id);
  }

  // PATCH /api/wallets/:id — edita nome e/ou tipo da carteira
  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Editar uma carteira' })
  @ApiParam({ name: 'id', description: 'UUID da carteira' })
  @ApiResponse({ status: 200, description: 'Carteira atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Carteira não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateWalletDto) {
    return this.walletsService.update(req.user.id, id, dto);
  }

  // DELETE /api/wallets/:id — remove a carteira (transações ficam com walletId = null)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Deletar uma carteira' })
  @ApiParam({ name: 'id', description: 'UUID da carteira' })
  @ApiResponse({ status: 204, description: 'Carteira deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Carteira não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  remove(@Request() req, @Param('id') id: string) {
    return this.walletsService.remove(req.user.id, id);
  }
}
