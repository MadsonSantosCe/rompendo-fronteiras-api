import { IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsString({ message: 'O código deve ser uma string' })
  @Matches(/^\d{6}$/, { message: 'O código deve conter 6 números.' })
  code: string;
}
