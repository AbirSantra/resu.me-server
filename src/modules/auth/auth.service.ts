import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async registerUser(registerUserData: RegisterUserDTO) {
    const { email, password, name } = registerUserData;

    // Check if user with same email already exists
    const existingUser = await this.db.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      throw new ConflictException('User already exists!');
    }

    // Hash password
    const hashPassword = await this.passwordService.hashPassword(password);

    // Create user
    const newUser = await this.db.user.create({
      data: {
        email: email,
        password: hashPassword,
        name: name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate Tokens
    const accessToken = this.tokenService.createAccessToken({
      id: newUser.id,
      email: newUser.email,
    });

    const refreshToken = this.tokenService.createAccessToken({
      id: newUser.id,
    });

    return {
      user: newUser,
      accessToken,
      refreshToken,
    };
  }

  async loginUser(loginUserData: LoginUserDTO) {
    const { email, password } = loginUserData;

    // Find the user by email
    const existingUser = await this.db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      throw new ConflictException('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException('Invalid credentials');
    }

    // Generate Tokens
    const accessToken = this.tokenService.createAccessToken({
      id: existingUser.id,
      email: existingUser.email,
    });

    const refreshToken = this.tokenService.createAccessToken({
      id: existingUser.id,
    });

    return {
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        createdAt: existingUser.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }
}
