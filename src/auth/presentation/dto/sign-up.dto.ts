import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 letras' })
  @MaxLength(50, { message: 'O nome deve ter no máximo 50 letras' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(20, { message: 'A senha deve ter no máximo 20 caracteres' })
  password: string;
}
