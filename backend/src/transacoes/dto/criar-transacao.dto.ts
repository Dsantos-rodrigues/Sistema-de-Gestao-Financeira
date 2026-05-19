import { IsEnum, IsNumber, IsString, IsOptional, IsDateString, IsUUID, Min } from 'class-validator';
import { TipoTransacao } from '../transacao.entity';

/**
 * DTO para criação de uma nova transação financeira.
 * Define e valida os dados recebidos na requisição.
 */
export class CriarTransacaoDto {
  @IsEnum(TipoTransacao, { message: 'Tipo deve ser ENTRADA ou SAIDA.' })
  tipo!: TipoTransacao;

  @IsNumber({}, { message: 'Valor deve ser um número.' })
  @Min(0.01, { message: 'Valor deve ser maior que zero.' })
  valor!: number;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsDateString({}, { message: 'Data deve ser uma data válida.' })
  data!: string;

  // ID da carteira onde a transação será registrada
  @IsUUID('4', { message: 'carteira_id deve ser um UUID válido.' })
  carteira_id!: string;
}