// create-asset.dto.ts — define e valida os dados da criação de ativo financeiro

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetType } from '@prisma/client';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ example: 'Petrobras', description: 'Nome do ativo' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiPropertyOptional({ example: 'PETR4', description: 'Código do ativo na bolsa (opcional)' })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Ticker deve ter no máximo 20 caracteres' })
  ticker?: string;

  @ApiProperty({
    enum: AssetType,
    example: AssetType.STOCK,
    description: 'STOCK=ação, CRYPTO=cripto, REAL_ESTATE=imóvel, FIXED_INCOME=renda fixa, FUND=fundo, OTHER=outro',
  })
  @IsEnum(AssetType, { message: 'Tipo inválido' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type: AssetType;

  @ApiProperty({ example: '10', description: 'Quantidade de unidades do ativo' })
  @IsDecimal({}, { message: 'Quantidade deve ser um número decimal válido' })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity: string;

  @ApiProperty({ example: '35.50', description: 'Preço pago por unidade na compra' })
  @IsDecimal({}, { message: 'Preço de compra deve ser um número decimal válido' })
  @IsNotEmpty({ message: 'Preço de compra é obrigatório' })
  purchasePrice: string;

  @ApiProperty({ example: '42.00', description: 'Preço atual por unidade' })
  @IsDecimal({}, { message: 'Preço atual deve ser um número decimal válido' })
  @IsNotEmpty({ message: 'Preço atual é obrigatório' })
  currentPrice: string;

  @ApiProperty({
    example: '2026-01-15T00:00:00.000Z',
    description: 'Data da compra no formato ISO 8601',
  })
  @IsDateString({}, { message: 'Data deve estar no formato ISO 8601' })
  @IsNotEmpty({ message: 'Data de compra é obrigatória' })
  purchasedAt: string;
}
