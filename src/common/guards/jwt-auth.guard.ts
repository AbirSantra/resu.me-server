import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly db: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = await this.validateToken(accessToken);

      request['user'] = payload;

      return true;
    } catch (error) {
      console.log(error);
      throw new HttpException('Session expired!', 420);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async validateToken(token: string): Promise<JwtPayload> {
    // Verify token signature
    const payload = this.jwtService.verify<JwtPayload>(token);

    const existingUser = await this.db.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!existingUser) {
      throw new HttpException('Invalid Credentials', 420);
    }

    return payload;
  }
}
