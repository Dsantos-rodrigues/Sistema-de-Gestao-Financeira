// auth.controller.ts — rotas HTTP de autenticação
// @Public() libera as rotas do guard global de JWT

import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Autenticação') // agrupa as rotas sob a tag "Autenticação" no Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/register — cria um novo usuário e retorna token JWT
  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso. Retorna dados do usuário e token JWT.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (campos faltando ou formato incorreto).',
  })
  @ApiResponse({ status: 409, description: 'Email já cadastrado.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/auth/login — autentica o usuário e retorna token JWT
  @Public()
  @Post('login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso. Retorna dados do usuário e token JWT.',
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
