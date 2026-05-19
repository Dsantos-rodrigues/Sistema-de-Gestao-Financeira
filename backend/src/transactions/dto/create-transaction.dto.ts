// create-transaction.dto.ts — define e valida os dados da criação de transação

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'Salário', description: 'Descrição da transação' })
  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(200, { message: 'Descrição deve ter no máximo 200 caracteres' })
  description: string;

  @ApiProperty({ example: '5000.00', description: 'Valor da transação com duas casas decimais' })
  @IsDecimal({}, { message: 'Valor deve ser um número decimal válido (ex: 150.00)' })
  @IsNotEmpty({ message: 'Valor é obrigatório' })
  amount: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.INCOME,
    description: 'INCOME para entrada, EXPENSE para saída',
  })
  @IsEnum(TransactionType, { message: 'Tipo deve ser INCOME ou EXPENSE' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type: TransactionType;

  @ApiPropertyOptional({ example: 'Trabalho', description: 'Categoria da transação (opcional)' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Categoria deve ter no máximo 100 caracteres' })
  category?: string;

  @ApiProperty({
    example: '2026-05-05T00:00:00.000Z',
    description: 'Data da transação no formato ISO 8601',
  })
  @IsDateString({}, { message: 'Data deve estar no formato ISO 8601' })
  @IsNotEmpty({ message: 'Data é obrigatória' })
  date: string;

  // carteira à qual essa transação pertence (opcional)
  @ApiPropertyOptional({ example: 'uuid-da-carteira', description: 'ID da carteira vinculada (opcional)' })
  @IsUUID('4', { message: 'walletId deve ser um UUID válido' })
  @IsOptional()
  walletId?: string;
}
