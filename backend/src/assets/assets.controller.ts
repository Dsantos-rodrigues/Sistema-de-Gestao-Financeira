// assets.controller.ts — rotas HTTP dos ativos financeiros

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
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@ApiTags('Ativos')
@ApiBearerAuth('JWT')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // POST /api/assets — registra novo ativo
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Registrar novo ativo financeiro' })
  @ApiResponse({ status: 201, description: 'Ativo registrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Request() req, @Body() dto: CreateAssetDto) {
    return this.assetsService.create(req.user.id, dto);
  }

  // GET /api/assets — lista todos os ativos com valor e lucro/prejuízo calculados
  @Get()
  @ApiOperation({ summary: 'Listar ativos com valor atual e lucro/prejuízo' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll(@Request() req) {
    return this.assetsService.findAll(req.user.id);
  }

  // PATCH /api/assets/:id — edita um ativo (ex: atualizar currentPrice com cotação atual)
  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Editar um ativo (ex: atualizar preço atual)' })
  @ApiParam({ name: 'id', description: 'UUID do ativo' })
  @ApiResponse({ status: 200, description: 'Ativo atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Ativo não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(req.user.id, id, dto);
  }

  // DELETE /api/assets/:id — remove o ativo do portfólio
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Deletar um ativo' })
  @ApiParam({ name: 'id', description: 'UUID do ativo' })
  @ApiResponse({ status: 204, description: 'Ativo deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Ativo não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  remove(@Request() req, @Param('id') id: string) {
    return this.assetsService.remove(req.user.id, id);
  }
}
