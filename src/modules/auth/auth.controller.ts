import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidate } from 'src/common/decorators/zod-validation.decorator';
import { RegisterUserDTO, RegisterUserSchema } from './dto/register-user.dto';
import { Response } from 'express';

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
}
