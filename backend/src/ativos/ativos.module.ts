import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './ativo.entity';

/**
 * Módulo responsável pelo gerenciamento de ativos financeiros.
 */
@Module({
  imports: [
    // Registra a entity Ativo para uso do TypeORM neste módulo
    TypeOrmModule.forFeature([Ativo]),
  ],
  exports: [TypeOrmModule],
})
export class AtivosModule {}