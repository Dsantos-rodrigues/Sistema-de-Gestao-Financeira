// prisma.service.ts — serviço que gerencia a conexão com o banco de dados
// É injetado em outros serviços do NestJS para fazer consultas ao banco

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // client gerado pelo Prisma 5 em node_modules/@prisma/client

@Injectable() // herda todos os métodos de acesso ao banco (user.findMany, user.create, etc.)
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // conecta ao banco quando o módulo NestJS é inicializado
  async onModuleInit() {
    await this.$connect();
  }

  // desconecta do banco quando o módulo NestJS é encerrado
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
