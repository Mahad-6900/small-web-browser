import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VisitDocument = HydratedDocument<Visit>;

@Schema({ timestamps: true })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  person!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ type: String, default: null, trim: true })
  fromAddress!: string | null;

  @Prop({ default: Date.now })
  visitedAt!: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);