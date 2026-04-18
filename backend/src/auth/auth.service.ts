import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { CadastroDto } from './dto/cadastro.dto';

/**
 * Serviço responsável pela autenticação de usuários.
 * Gerencia registro, login e geração de tokens JWT.
 */
@Injectable()
export class AuthService {
  constructor(
    // Injeta o serviço de usuários para operações no banco
    private usersService: UsersService,
    // Injeta o serviço JWT para geração e validação de tokens
    private jwtService: JwtService,
  ) {}

  /**
   * Autentica um usuário e retorna o token JWT.
   * @param dados - DTO com email e senha do usuário
   * @returns Token JWT e dados básicos do usuário
   * @throws UnauthorizedException se email ou senha estiverem incorretos
   */
  async login(dados: LoginDto) {
    // Tenta encontrar o usuário pelo email informado
    const usuario = await this.usersService.buscarPorEmail(dados.email);

    // Mensagem genérica de propósito — não revela se o email existe ou não
    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // Compara a senha digitada com o hash salvo no banco
    // o bcrypt faz essa comparação sem precisar descriptografar
    const senhaCorreta = await bcrypt.compare(dados.senha, usuario.senha_hash);

    if (!senhaCorreta) {
      // Mesma mensagem genérica para não revelar qual campo está errado
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // Monta o payload do token — não incluir dados sensíveis aqui
    // pois o payload pode ser decodificado por qualquer um com o token
    const payload = {
      sub: usuario.id,     // sub é o padrão JWT para identificar o dono do token
      email: usuario.email,
      nome: usuario.nome,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }

  /**
   * Registra um novo usuário e retorna o token JWT.
   * @param dados - DTO com nome, email e senha
   * @returns Token JWT e dados básicos do usuário criado
   * @throws ConflictException se o email já estiver cadastrado
   */
  async cadastrar(dados: CadastroDto) {
    // Verifica se já existe uma conta com esse email
    const jaExiste = await this.usersService.buscarPorEmail(dados.email);
    if (jaExiste) {
      throw new ConflictException('Já existe uma conta com esse e-mail.');
    }

    // Criptografa a senha antes de salvar no banco
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const usuario = await this.usersService.criar(dados.nome, dados.email, senhaHash);

    // Já gera o token para o usuário não precisar fazer login após o cadastro
    const payload = { sub: usuario.id, email: usuario.email, nome: usuario.nome };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }
}