// auth.module.ts — agrupa tudo que pertence à autenticação
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Módulo responsável pela autenticação da aplicação.
 * Configura o JWT, o Passport e integra o UsersModule para validação de credenciais.
 */
@Module({
  imports: [
    UsersModule, // Necessário para o AuthService buscar usuários no banco de dados
    PassportModule.register({ defaultStrategy: 'jwt' }), // Habilita estratégias de autenticação
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'troca-esse-segredo-antes-de-subir-pra-producao', // Chave secreta para assinar os tokens
      signOptions: { 
        expiresIn: '7d' // Token expira em 7 dias (ajustado conforme a segunda versão)
      },
    }),
  ],
  controllers: [AuthController], // Registra os endpoints HTTP do AuthController
  providers: [
    AuthService,  // Lógica de negócio (login/register)
    JwtStrategy,  // Estratégia de validação do token JWT
    JwtGuard,     // Guard que verifica o token e respeita o decorator @Public()
  ],
  exports: [JwtGuard, JwtStrategy, PassportModule], // Exporta para que o AppModule registre globalmente
})
export class AuthModule {}