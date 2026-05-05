// update-transaction.dto.ts — todos os campos são opcionais na edição
// O PartialType do Swagger herda o CreateTransactionDto e torna tudo opcional automaticamente

import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  // PartialType torna todos os campos do CreateTransactionDto opcionais
  // Assim o usuário pode enviar só os campos que quer atualizar
  @ApiPropertyOptional({
    example: 'Salário atualizado',
    description: 'Novo valor para qualquer campo da transação',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
