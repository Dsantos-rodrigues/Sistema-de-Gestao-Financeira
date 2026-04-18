import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CadastroDto } from './dto/cadastro.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dados: LoginDto) {
    return this.authService.login(dados);
  }

  // POST /auth/cadastro — cria uma nova conta e já devolve o token
  // assim o usuário não precisa fazer login logo depois de se cadastrar
  @Post('cadastro')
  async cadastrar(@Body() dados: CadastroDto) {
    return this.authService.cadastrar(dados);
  }
}
