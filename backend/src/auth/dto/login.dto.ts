import { IsEmail, IsString, MinLength } from 'class-validator';

// esse DTO define exatamente o que esperamos receber no corpo da requisição de login
// se o usuário mandar qualquer coisa fora disso, o NestJS já rejeita antes de chegar no serviço
export class LoginDto {
  @IsEmail({}, { message: 'Manda um e-mail válido, por favor.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha tem que ter pelo menos 6 caracteres.' })
  senha: string;
// login.dto.ts — define e valida os dados esperados no login

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'anderson@email.com', description: 'Email cadastrado' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(150, { message: 'Email deve ter no máximo 150 caracteres' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  password: string;
}
