// create-wallet.dto.ts — define e valida os dados da criação de carteira

import { ApiProperty } from '@nestjs/swagger';
import { WalletType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ example: 'Conta Nubank', description: 'Nome da carteira' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    enum: WalletType,
    example: WalletType.CHECKING,
    description: 'CHECKING=conta corrente, SAVINGS=poupança, CASH=espécie, INVESTMENT=investimento',
  })
  @IsEnum(WalletType, { message: 'Tipo deve ser CHECKING, SAVINGS, CASH ou INVESTMENT' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type: WalletType;
}
