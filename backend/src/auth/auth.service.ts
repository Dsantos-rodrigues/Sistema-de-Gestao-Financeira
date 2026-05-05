// auth.service.ts — contém a lógica de negócio de registro e login
// Usa o PrismaService para acessar o banco e o JwtService para gerar tokens

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService, // acesso ao banco de dados
    private readonly jwtService: JwtService, // geração e validação de tokens JWT
  ) {}

  // cadastra um novo usuário no sistema
  async register(dto: RegisterDto) {
    // verifica se já existe um usuário com esse email
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Email já cadastrado');
    }

    // gera o hash da senha — nunca salvamos a senha em texto puro
    // o número 10 é o "salt rounds" — quanto maior, mais seguro e mais lento
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // cria o usuário no banco com a senha hasheada
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    // gera o token JWT com o id e email do usuário no payload
    const token = this.generateToken(user.id, user.email);

    // retorna os dados do usuário (sem a senha) e o token
    return {
      user: { id: user.id, name: user.name, email: user.email },
      token,
    };
  }

  // autentica um usuário existente e retorna um token JWT
  async login(dto: LoginDto) {
    // busca o usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // retorna erro genérico para não revelar se o email existe ou não
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // compara a senha enviada com o hash salvo no banco
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // gera o token JWT
    const token = this.generateToken(user.id, user.email);

    // retorna os dados do usuário (sem a senha) e o token
    return {
      user: { id: user.id, name: user.name, email: user.email },
      token,
    };
  }

  // método privado que gera o token JWT com o payload do usuário
  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}
