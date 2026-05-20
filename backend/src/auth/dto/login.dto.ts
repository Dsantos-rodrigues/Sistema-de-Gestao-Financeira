// login.dto.ts — define e valida os dados esperados no login
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'Email cadastrado do usuário' })
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @MaxLength(150, { message: 'O e-mail deve ter no máximo 150 caracteres.' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha de acesso do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(100, { message: 'A senha deve ter no máximo 100 caracteres.' })
  password: string;
}