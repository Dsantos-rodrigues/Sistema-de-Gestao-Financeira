import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CadastroDto } from './dto/cadastro.dto';

/**
 * Controller responsável pelas rotas de autenticação.
 * Expõe os endpoints de registro e login.
 */
@Controller('auth')
export class AuthController {
  constructor(
    // Injeta o serviço de autenticação
    private authService: AuthService,
  ) {}

  /**
   * Autentica um usuário existente.
   * POST /auth/login
   * @param dados - DTO com email e senha
   * @returns Token JWT e dados do usuário
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dados: LoginDto) {
    return this.authService.login(dados);
  }

  /**
   * Registra um novo usuário e já retorna o token JWT.
   * POST /auth/cadastro
   * @param dados - DTO com nome, email e senha
   * @returns Token JWT e dados do usuário criado
   */
  @Post('cadastro')
  async cadastrar(@Body() dados: CadastroDto) {
    return this.authService.cadastrar(dados);
  }
}