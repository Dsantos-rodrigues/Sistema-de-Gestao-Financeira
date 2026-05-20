// users.service.ts — gerencia a criação e busca de usuários no Prisma
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo usuário com a senha criptografada.
   */
  async criar(name: string, email: string, password: string) {
    // Verifica se o e-mail já está cadastrado para evitar duplicidade
    const usuarioExiste = await this.buscarPorEmail(email);
    if (usuarioExiste) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    // Gera o hash seguro da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário usando o client do Prisma (tabela mapeada como 'user')
    const usuario = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Remove o password do objeto antes de retornar para proteger o dado sensível
    const { password: _, ...resultado } = usuario;
    return resultado;
  }

  /**
   * Busca um usuário pelo email (usado no login e validações).
   */
  async buscarPorEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}