import { IsEmail, IsNotEmpty, MinLength, Matches, MaxLength, IsOptional } from "class-validator";


export class AccountDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(20)
    @Matches(/^[a-z0-9]+$/)
    username: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    password: string;

    @IsOptional()
    @MinLength(10)
    @MaxLength(11)
    phone: string;

    // @IsNotEmpty()
    // roleId: number;
}

export class SignInDto {
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    password: string
    @IsNotEmpty()
    ttl: string
}

export class ChangPassword {
    @IsNotEmpty()
    current_password: string;

    @IsNotEmpty()
    new_password: string;
}
