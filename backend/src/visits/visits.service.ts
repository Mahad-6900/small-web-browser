import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visit } from './visit.schema.js';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name)
    private readonly visitModel: Model<Visit>,
  ) {}

  async create(
    person: string,
    address: string,
    fromAddress: string | null,
  ) {
    return this.visitModel.create({
      person: new Types.ObjectId(person),
      address: address.trim().toLowerCase(),
      fromAddress,
      visitedAt: new Date(),
    });
  }

  async findByPerson(person: string) {
    if (!Types.ObjectId.isValid(person)) {
      throw new BadRequestException('Invalid person ID');
    }

    return this.visitModel
      .find({ person: new Types.ObjectId(person) })
      .sort({ visitedAt: -1 })
      .limit(200)
      .exec();
  }
}