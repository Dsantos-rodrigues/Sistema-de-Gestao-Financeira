import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// esse tipo representa um usuário dentro do sistema
// por enquanto tá simples assim, mas quando a Bianca montar o banco
// a gente vai trocar pra uma entidade do TypeORM
export type Usuario = {
  id: number;
  nome: string;
  email: string;
  senhaHash: string; // nunca salvamos a senha em texto puro — sempre o hash
};

@Injectable()
export class UsersService {
  // estou usando uma lista em memória por enquanto
  // assim a gente consegue testar o fluxo de login sem precisar do banco pronto
  // quando o PostgreSQL estiver configurado, só trocar esse array por queries reais
  private usuarios: Usuario[] = [];

  constructor() {
    // criando um usuário de teste pra gente poder testar o login agora
    // esse bloco some quando conectarmos ao banco de verdade
    this.criarUsuarioDeTeste();
  }

  private async criarUsuarioDeTeste() {
    // o bcrypt transforma a senha em um hash irreversível
    // o número 10 é o "custo" — quanto maior, mais seguro, mas mais lento
    // 10 é o ponto doce que a maioria dos projetos usa
    const hash = await bcrypt.hash('senha123', 10);

    this.usuarios.push({
      id: 1,
      nome: 'Anderson Teste',
      email: 'anderson@teste.com',
      senhaHash: hash,
    });
  }

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    return this.usuarios.find((u) => u.email === email);
  }

  async criar(nome: string, email: string, senhaHash: string): Promise<Usuario> {
    const novoId = this.usuarios.length + 1;
    const usuario: Usuario = { id: novoId, nome, email, senhaHash };
    this.usuarios.push(usuario);
    return usuario;
  }
}
