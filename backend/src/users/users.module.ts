// users.module.ts — configura o escopo do módulo de usuários
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Fornece o PrismaService para o seu UsersService
  controllers: [],         // Deixamos vazio já que o controller de usuários não existe
  providers: [UsersService],
  exports: [UsersService], // Essencial para o AuthModule conseguir importar o UsersService!
})
export class UsersModule {}