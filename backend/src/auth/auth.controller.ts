import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Autenticação') // Agrupa as rotas sob a tag "Autenticação" no Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registra um novo usuário e retorna o token JWT.
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso. Retorna dados do usuário e token JWT.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Autentica um usuário existente.
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // Garante que o retorno seja 200 OK em vez de 201 Created
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