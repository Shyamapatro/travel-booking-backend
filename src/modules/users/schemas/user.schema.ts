import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, index: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'BLOCKED';
}

export const UserSchema = SchemaFactory.createForClass(User);
