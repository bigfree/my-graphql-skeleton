import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class RegisterInput {
    @Field(() => String, {
        description: 'User unique email address',
    })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Field(() => String, {
        description: 'User password',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
