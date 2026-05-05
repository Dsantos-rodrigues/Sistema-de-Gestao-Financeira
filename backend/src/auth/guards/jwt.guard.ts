// jwt.guard.ts — guard global que protege todas as rotas da aplicação
// Rotas marcadas com @Public() são liberadas sem verificação de token
// Todas as outras exigem um token JWT válido no header: Authorization: Bearer <token>

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // verifica se a rota foi marcada com @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // verifica o decorator no método
      context.getClass(), // verifica o decorator na classe
    ]);

    // se for pública, libera sem verificar token
    if (isPublic) return true;

    // caso contrário, valida o token JWT normalmente
    return super.canActivate(context);
  }
}
