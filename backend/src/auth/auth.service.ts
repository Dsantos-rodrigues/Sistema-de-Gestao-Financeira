// auth.service.ts — contém a lógica de negócio de registro e login
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService, // Acesso direto ao banco de dados via Prisma
    private readonly jwtService: JwtService, // Geração e validação de tokens JWT
  ) {}

  /**
   * Cadastra um novo usuário no sistema.
   * @param dto - Dados de registro (name, email, password)
   */
  async register(dto: RegisterDto) {
    // Verifica se já existe um usuário com esse email
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    
    if (exists) {
      throw new ConflictException('Email já cadastrado');
    }

    // Gera o hash da senha de forma segura antes de salvar
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Cria o usuário no banco com a senha hasheada
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    // Gera o token JWT com o id e email do usuário no payload
    const token = this.generateToken(user.id, user.email);

    // Retorna os dados do usuário estruturados e o token
    return {
      token,
      usuario: {
        id: user.id,
        nome: user.name,
        email: user.email,
      },
    };
  }

  /**
   * Autentica um usuário existente e retorna um token JWT.
   * @param dto - Dados de login (email, password)
   */
  async login(dto: LoginDto) {
    // Busca o usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Retorna erro genérico para segurança de dados
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // Compara a senha enviada com o hash salvo no banco
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // Gera o token JWT
    const token = this.generateToken(user.id, user.email);

    // Retorna mapeado para o formato esperado pelo frontend
    return {
      accessToken: token,
      usuario: {
        id: user.id,
        nome: user.name,
        email: user.email,
      },
    };
  }

  /**
   * Método interno para assinar o token JWT.
   */
  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}