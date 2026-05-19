import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Estratégia JWT para validação de tokens nas rotas protegidas.
 * Extrai e valida o token do header Authorization: Bearer <token>
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrai o token do header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Rejeita tokens expirados
      ignoreExpiration: false,
      // Secret deve ser o mesmo usado para assinar o token
      secretOrKey: process.env.JWT_SECRET || 'troca-esse-segredo-antes-de-subir-pra-producao',
    });
  }

  /**
   * Chamado automaticamente após validar a assinatura do token.
   * O retorno é injetado no Request como req.user
   * @param payload - Dados decodificados do token JWT
   */
  async validate(payload: { sub: string; email: string; nome: string }) {
    return {
      id: payload.sub,
      email: payload.email,
      nome: payload.nome,
    };
  }
}