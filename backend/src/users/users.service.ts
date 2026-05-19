import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

/**
 * Serviço responsável pelas operações de usuário.
 * Gerencia criação e busca de usuários no banco de dados.
 */
@Injectable()
export class UsersService {
  constructor(
    // Injeta o repositório do TypeORM para a entity User
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Cria um novo usuário com a senha criptografada.
   * @param nome - Nome completo do usuário
   * @param email - Email único do usuário
   * @param senha - Senha em texto puro (será criptografada)
   * @returns O usuário criado sem a senha_hash
   */
  async criar(nome: string, email: string, senha: string): Promise<Omit<User, 'senha_hash'>> {
    // Gera o hash da senha com custo 10 (recomendado para produção)
    const senha_hash = await bcrypt.hash(senha, 10);

    const usuario = this.usersRepository.create({
      nome,
      email,
      senha_hash,
    });

    const salvo = await this.usersRepository.save(usuario);

    // Remove a senha_hash antes de retornar para não expor dados sensíveis
    const { senha_hash: _, ...resultado } = salvo;
    return resultado;
  }

  /**
   * Busca um usuário pelo email.
   * @param email - Email do usuário a ser buscado
   * @returns O usuário encontrado ou null
   */
  async buscarPorEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
