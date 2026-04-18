import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,

    // configura o JWT com segredo e tempo de expiração
    // ATENÇÃO: o secret não pode ficar hardcoded assim quando for pra produção
    // tem que vir de uma variável de ambiente — no GCP vai pro Secret Manager (tarefa do Anderson)
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'troca-esse-segredo-antes-de-subir-pra-producao',
      signOptions: {
        expiresIn: '8h', // token dura 8 horas — suficiente pra um dia de uso sem ficar logando toda hora
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
