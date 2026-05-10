import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT para proteger rotas que exigem autenticação.
 * Use @UseGuards(JwtAuthGuard) nos endpoints protegidos.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}