// jwt.strategy.ts — estratégia que valida o token JWT em cada requisição protegida
// O Passport usa essa estratégia quando o JwtGuard é aplicado em uma rota

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // extrai o token do header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // chave secreta usada para verificar a assinatura do token
      // a exclamação (!) garante ao TypeScript que o valor existe — definido no .env
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // chamado automaticamente após o token ser validado com sucesso
  // o retorno é anexado ao request como req.user
  validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
