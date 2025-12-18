import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header as a Bearer token
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'), // Secret key to verify the token
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
