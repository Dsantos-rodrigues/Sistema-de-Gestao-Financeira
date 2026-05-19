import { IsOptional, IsDateString, IsUUID } from 'class-validator';

/**
 * DTO para filtros das agregações financeiras.
 * Todos os campos são opcionais — o usuário pode filtrar
 * por período, por carteira, ou consultar tudo.
 */
export class FiltroAgregacaoDto {
  @IsDateString({}, { message: 'data_inicio deve ser uma data válida.' })
  @IsOptional()
  data_inicio?: string;

  @IsDateString({}, { message: 'data_fim deve ser uma data válida.' })
  @IsOptional()
  data_fim?: string;

  @IsUUID('4', { message: 'carteira_id deve ser um UUID válido.' })
  @IsOptional()
  carteira_id?: string;
}