// auth.module.ts — agrupa tudo que pertence à autenticação
// Importado no AppModule para registrar as rotas e providers de auth

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule, // habilita o uso de estratégias de autenticação (jwt, local, etc.)
    JwtModule.register({
      secret: process.env.JWT_SECRET, // chave secreta para assinar os tokens
      signOptions: { expiresIn: '7d' }, // token expira em 7 dias
    }),
  ],
  controllers: [AuthController], // registra as rotas POST /api/auth/register e POST /api/auth/login
  providers: [
    AuthService, // lógica de negócio de registro e login
    JwtStrategy, // estratégia de validação do token JWT
    JwtGuard, // guard global que verifica token JWT e respeita @Public()
  ],
  exports: [JwtGuard], // exporta o guard para o AppModule registrar como guard global
})
export class AuthModule {}
