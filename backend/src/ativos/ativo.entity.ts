import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Carteira } from '../carteiras/carteira.entity';

/**
 * Tipos de ativos financeiros suportados pelo sistema
 */
export enum TipoAtivo {
  ACAO = 'ACAO',
  FII = 'FII',
  ETF = 'ETF',
  CRIPTO = 'CRIPTO',
  RENDA_FIXA = 'RENDA_FIXA',
}

/**
 * Entity que representa um ativo financeiro dentro de uma carteira.
 * Ex: PETR4, BTC, HGLG11
 */
@Entity('ativos')
export class Ativo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 20 })
  ticker!: string;

  @Column({ length: 100 })
  nome!: string;

  @Column({ type: 'enum', enum: TipoAtivo })
  tipo!: TipoAtivo;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0 })
  quantidade!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  preco_medio!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relacionamento: muitos ativos pertencem a uma carteira
  @ManyToOne(() => Carteira, { eager: false })
  @JoinColumn({ name: 'carteira_id' })
  carteira!: Carteira;
}