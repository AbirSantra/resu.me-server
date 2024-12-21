import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidate } from 'src/common/decorators/zod-validation.decorator';
import { RegisterUserDTO, RegisterUserSchema } from './dto/register-user.dto';
import { Request, Response } from 'express';
import { LoginUserDTO, LoginUserSchema } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ZodValidate(RegisterUserSchema)
  async register(
    @Body() body: RegisterUserDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Register user and get tokens
    const { user, accessToken, refreshToken } =
      await this.authService.registerUser(body);

    // Set refresh token in HTTP-only secure cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 30 days
    });

    return { user, accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ZodValidate(LoginUserSchema)
  async login(
    @Body() body: LoginUserDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Login user and get tokens
    const { user, accessToken, refreshToken } =
      await this.authService.loginUser(body);

    // Set refresh token in HTTP-only secure cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { user, accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request) {
    // console.log(request.cookies);

    // Extract refresh token from cookie
    const refreshToken = request.cookies['refreshToken'];

    // Check if refresh token exists
    if (!refreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Refresh access token
    const { user, accessToken: newAccessToken } =
      await this.authService.refreshSession(refreshToken);

    return { user, newAccessToken };
  }
}
