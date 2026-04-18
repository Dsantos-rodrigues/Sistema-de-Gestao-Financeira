import { IsEmail, IsString, MinLength } from 'class-validator';

// esse DTO define exatamente o que esperamos receber no corpo da requisição de login
// se o usuário mandar qualquer coisa fora disso, o NestJS já rejeita antes de chegar no serviço
export class LoginDto {
  @IsEmail({}, { message: 'Manda um e-mail válido, por favor.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha tem que ter pelo menos 6 caracteres.' })
  senha: string;
}
