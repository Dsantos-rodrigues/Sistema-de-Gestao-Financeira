import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

/**
 * Entity que representa uma carteira financeira do usuário.
 * Um usuário pode ter múltiplas carteiras (ex: carteira de ações, cripto, etc)
 */
@Entity('carteiras')
export class Carteira {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  nome!: string;

  @Column({ nullable: true })
  descricao!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo_total!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relacionamento: muitas carteiras pertencem a um usuário
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}