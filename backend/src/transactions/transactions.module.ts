// transactions.module.ts — agrupa tudo que pertence às transações financeiras
// Importado no AppModule para registrar as rotas e providers de transações

import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController], // registra as rotas POST e GET /api/transactions
  providers: [TransactionsService], // lógica de negócio das transações
})
export class TransactionsModule {}
