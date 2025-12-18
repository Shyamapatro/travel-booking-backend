import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: Joi.object({
      MONGO_URI: Joi.string().required(),
    }),
  }),

  // ✅ THIS CREATES DatabaseConnection
  MongooseModule.forRoot(process.env.MONGO_URI as string),

    AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
