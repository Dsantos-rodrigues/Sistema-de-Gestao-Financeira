import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carteira } from './carteira.entity';

/**
 * Módulo responsável pelo gerenciamento de carteiras financeiras.
 */
@Module({
  imports: [
    // Registra a entity Carteira para uso do TypeORM neste módulo
    TypeOrmModule.forFeature([Carteira]),
  ],
  exports: [TypeOrmModule],
})
export class CarteirasModule {}