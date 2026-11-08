import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { PeopleService } from './people.service.js';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  findAll() {
    return this.peopleService.findAll();
  }

  @Post()
  create(@Body('name') name: string) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Person name is required');
    }

    if (name.trim().length > 60) {
      throw new BadRequestException('Name must be 60 characters or less');
    }

    return this.peopleService.create(name);
  }
}