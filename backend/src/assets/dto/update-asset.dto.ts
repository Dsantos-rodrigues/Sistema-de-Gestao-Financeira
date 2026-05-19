// update-asset.dto.ts — campos opcionais para edição de ativo
// Útil principalmente para atualizar o currentPrice quando o preço de mercado mudar

import { PartialType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-asset.dto';

// PartialType herda todos os campos do CreateAssetDto e os torna opcionais
export class UpdateAssetDto extends PartialType(CreateAssetDto) {}
