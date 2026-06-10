import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { ConflictException } from 'src/core/exceptions/conflict.exceptions';
import { ErrorCodes } from 'src/core/exceptions/error-codes';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { NotFoundException } from 'src/core/exceptions/not-found.exceptions';
import { UnauthorizedException } from 'src/core/exceptions/unauthorized.exceptions';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;
    constructor(
        private readonly usersService: UsersService,
    ) { }

    //Register a new user 
    async register(dto: RegisterDto) {
        //Check if email already exists
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException(
                ErrorCodes.EMAIL_ALREADY_EXISTS,
                'This email is already registered',
            )
        }
        //hash password
        const hashedPassword = await this.hashPassword(dto.password);
        //create user
        const user = await this.usersService.createUser({
            email: dto.email,
            phone: dto.phone,
            firstName: dto.firstName,
            lastName: dto.lastName,
            passwordHash: hashedPassword,
            avatarUrl: dto.avatarUrl,
            communityId: dto.communityId,
            emailVerifiedAt: null,
        });

        //send otp for email and phone verification

        //return response
        return {
            message: 'User created successfully',
            data: {
                userId: user.id,
                requiredVerification: true,
            }
        }
    }

    //Login
    async login(dto: LoginDto) {
        //Check if user exists
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (!existingUser) {
            throw new NotFoundException(
                ErrorCodes.USER_NOT_FOUND,
                'User not found',
            )
        }
        //check if email is verified
        if (existingUser.emailVerifiedAt === null) {
            throw new UnauthorizedException(
                ErrorCodes.EMAIL_NOT_VERIFIED,
                'Please verify your email before logging in',
            )
        }
        //verify password
        const isValidPassword = await this.verifyPassword(dto.password, existingUser.passwordHash);
        if (!isValidPassword) {
            throw new UnauthorizedException(
                ErrorCodes.INVALID_CREDENTIALS,
                'Invalid Email or Password',
            )
        }

        return {
            message: 'User logged in successfully',
            data: {
                userId: existingUser.id,
            }
        }

    }



    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}
