import { IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * DTO para filtros das agregações financeiras.
 * Todos os campos são opcionais — o usuário pode filtrar
 * por período, categoria ou nenhum dos dois.
 */
export class FiltroAgregacaoDto {
  // Data inicial do período (ex: "2026-01-01")
  @IsDateString({}, { message: 'data_inicio deve ser uma data válida.' })
  @IsOptional()
  data_inicio?: string;

  // Data final do período (ex: "2026-12-31")
  @IsDateString({}, { message: 'data_fim deve ser uma data válida.' })
  @IsOptional()
  data_fim?: string;

  // Filtrar por categoria específica (ex: "alimentação")
  @IsString()
  @IsOptional()
  categoria?: string;
}