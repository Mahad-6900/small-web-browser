import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { VisitsService } from './visits.service.js';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(
    @Body('person') person: string,
    @Body('address') address: string,
    @Body('fromAddress') fromAddress: string | null,
  ) {
    if (!person || !address) {
      throw new BadRequestException(
        'Person and address are required',
      );
    }

    return this.visitsService.create(
      person,
      address,
      fromAddress || null,
    );
  }

  @Get()
  findByPerson(@Query('person') person: string) {
    if (!person) {
      throw new BadRequestException('Person ID is required');
    }

    return this.visitsService.findByPerson(person);
  }
}