// public.decorator.ts — marca uma rota como pública (não exige token JWT)
// Uso: adicione @Public() acima de qualquer rota que não precise de autenticação
// Exemplo: endpoints de login e registro

import { SetMetadata } from '@nestjs/common';

// chave usada para identificar rotas públicas nos guards
export const IS_PUBLIC_KEY = 'isPublic';

// decorator que anota a rota com a chave IS_PUBLIC_KEY = true
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
