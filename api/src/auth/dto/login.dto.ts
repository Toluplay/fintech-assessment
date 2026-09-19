import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  /** Email address or phone number. */
  @IsString()
  @IsNotEmpty({ message: 'Email or phone number is required' })
  @MaxLength(254)
  identifier!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password!: string;
}
