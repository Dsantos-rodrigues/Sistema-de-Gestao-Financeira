import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transacao } from './transacao.entity';
import { Carteira } from '../carteiras/carteira.entity';
import { TransacoesService } from './transacoes.service';
import { TransacoesController } from './transacoes.controller';

/**
 * Módulo responsável pelo gerenciamento de transações financeiras.
 * Importa também a entity Carteira para validar o acesso.
 */
@Module({
  imports: [
    // Registra a entity Transacao para uso do TypeORM neste módulo
    TypeOrmModule.forFeature([Transacao, Carteira]),
  ],
  controllers: [TransacoesController],
  providers: [TransacoesService],
  exports: [TransacoesService],
})
export class TransacoesModule {}