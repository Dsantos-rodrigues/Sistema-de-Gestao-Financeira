import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

/**
 * Módulo responsável pela autenticação da aplicação.
 * Configura o JWT e integra o UsersModule para validação de credenciais.
 */
@Module({
  imports: [
    // Importa o UsersModule para ter acesso ao UsersService
    UsersModule,

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
  providers: [AuthService],
})
export class AuthModule {}