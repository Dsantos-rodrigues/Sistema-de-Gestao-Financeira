// auth.module.ts — agrupa tudo que pertence à autenticação
// Importado no AppModule para registrar as rotas e providers de auth

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

/**
 * Módulo responsável pela autenticação da aplicação.
 * Configura o JWT e integra o UsersModule para validação de credenciais.
 */
@Module({
  imports: [
    // Importa o UsersModule para ter acesso ao UsersService
    UsersModule,
    // Configura o Passport com JWT como estratégia padrão
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configura o JWT com segredo e tempo de expiração
    // ATENÇÃO: o secret não pode ficar hardcoded em produção
    // no GCP vai para o Secret Manager — tarefa do Anderson
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'troca-esse-segredo-antes-de-subir-pra-producao',
      signOptions: {
        expiresIn: '8h', // token dura 8h — suficiente para um dia de uso
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Exporta o guard para uso em outros módulos
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
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
