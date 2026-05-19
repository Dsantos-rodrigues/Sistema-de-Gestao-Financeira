import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transacao } from './transacao.entity';

/**
 * Módulo responsável pelo gerenciamento de transações financeiras.
 */
@Module({
  imports: [
    // Registra a entity Transacao para uso do TypeORM neste módulo
    TypeOrmModule.forFeature([Transacao]),
  ],
  exports: [TypeOrmModule],
})
export class TransacoesModule {}