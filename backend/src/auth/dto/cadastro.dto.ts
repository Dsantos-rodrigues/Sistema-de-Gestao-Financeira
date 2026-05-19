import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CadastroDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;
}
