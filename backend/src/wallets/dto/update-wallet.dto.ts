// update-wallet.dto.ts — campos opcionais para edição de carteira

import { PartialType } from '@nestjs/swagger';
import { CreateWalletDto } from './create-wallet.dto';

// PartialType herda todos os campos do CreateWalletDto e os torna opcionais
export class UpdateWalletDto extends PartialType(CreateWalletDto) {}
