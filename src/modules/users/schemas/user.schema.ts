import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { UserStatus } from '../enums/user-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, index: true, trim: true })
  email: string;

  @Prop({ select: false, trim: true })
  password: string;

  @Prop({ default: UserStatus.ACTIVE, enum: UserStatus })
  status: UserStatus;

  @Prop({ trim: true })
  phoneNumber: string;

  @Prop({ default: '+91', trim: true })
  countryCode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
