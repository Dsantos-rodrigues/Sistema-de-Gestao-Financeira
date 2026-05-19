// prisma.module.ts — módulo que disponibiliza o PrismaService para o resto da aplicação
// Ao importar o PrismaModule em qualquer outro módulo, o PrismaService fica disponível para injeção

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // torna o módulo global — não precisa importar em cada módulo, só uma vez no AppModule
@Module({
  providers: [PrismaService], // registra o PrismaService como um provider do NestJS
  exports: [PrismaService], // exporta para que outros módulos possam injetar o PrismaService
})
export class PrismaModule {}
