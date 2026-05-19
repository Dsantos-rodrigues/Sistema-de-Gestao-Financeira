import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carteira } from './carteira.entity';
import { Transacao } from '../transacoes/transacao.entity';
import { CarteirasService } from './carteiras.service';
import { CarteirasController } from './carteiras.controller';

/**
 * Módulo responsável pelo gerenciamento de carteiras e patrimônio.
 * Importa também a entity Transacao para cálculo de saldos.
 */
@Module({
  imports: [
    // Registra as entities necessárias para este módulo
    TypeOrmModule.forFeature([Carteira, Transacao]),
  ],
  controllers: [CarteirasController],
  providers: [CarteirasService],
  exports: [CarteirasService],
})
export class CarteirasModule {}