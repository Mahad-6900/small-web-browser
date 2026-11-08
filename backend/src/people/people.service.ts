import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person } from './person.schema.js';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name)
    private readonly personModel: Model<Person>,
  ) {}

  async findAll() {
    return this.personModel.find().sort({ name: 1 }).exec();
  }

  async create(name: string) {
    const cleanName = name.trim();

    const existingPerson = await this.personModel.findOne({
      name: cleanName,
    });

    if (existingPerson) {
      return existingPerson;
    }

    return this.personModel.create({ name: cleanName });
  }
}