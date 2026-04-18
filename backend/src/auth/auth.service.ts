import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { CadastroDto } from './dto/cadastro.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dados: LoginDto) {
    // primeiro a gente tenta achar o usuário pelo email que veio
    const usuario = await this.usersService.buscarPorEmail(dados.email);

    // se não achou ninguém com esse email, para tudo aqui
    // a mensagem é genérica de propósito — não queremos entregar se o email existe ou não
    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // agora compara a senha que o usuário digitou com o hash que está salvo
    // o bcrypt sabe fazer essa comparação mesmo sem "desencriptar" nada
    const senhaCorreta = await bcrypt.compare(dados.senha, usuario.senha_hash);

    if (!senhaCorreta) {
      // mesma mensagem de cima — não deixa o atacante saber se errou o email ou a senha
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // chegou aqui, tudo certo! a gente monta o payload do token
    // esse payload vai ficar "dentro" do JWT — não coloca dado sensível aqui
    // porque qualquer um com o token consegue decodificar (mas não forjar)
    const payload = {
      sub: usuario.id,   // sub é o padrão JWT pra identificar o dono do token
      email: usuario.email,
      nome: usuario.nome,
    };

    // gera o token JWT e devolve pro front-end
    // o front vai guardar isso (localStorage ou cookie) e mandar em toda requisição protegida
    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }

  async cadastrar(dados: CadastroDto) {
    const jaExiste = await this.usersService.buscarPorEmail(dados.email);
    if (jaExiste) {
      throw new ConflictException('Já existe uma conta com esse e-mail.');
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const usuario = await this.usersService.criar(dados.nome, dados.email, senhaHash);

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
