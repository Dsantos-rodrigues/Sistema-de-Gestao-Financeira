import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Carteira } from '../carteiras/carteira.entity';

/**
 * Tipos de transação financeira suportados pelo sistema
 */
export enum TipoTransacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

/**
 * Entity que representa uma transação financeira do usuário.
 * Registra entradas e saídas vinculadas a uma carteira.
 */
@Entity('transacoes')
export class Transacao {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: TipoTransacao })
  tipo!: TipoTransacao;

  @Column({ length: 100, nullable: true })
  categoria!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor!: number;

  @Column({ nullable: true })
  descricao!: string;

  @Column({ type: 'date' })
  data!: Date;

  @CreateDateColumn()
  created_at!: Date;

  // Relacionamento: muitas transações pertencem a um usuário
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Relacionamento: muitas transações pertencem a uma carteira
  @ManyToOne(() => Carteira, { eager: false })
  @JoinColumn({ name: 'carteira_id' })
  carteira!: Carteira;
}