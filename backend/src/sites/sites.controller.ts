
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { SitesService } from './sites.service.js';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  @Get('search')
  search(@Query('q') query: string) {
    if (!query || !query.trim()) {
      throw new BadRequestException('Search query is required.');
    }

    if (query.trim().length > 100) {
      throw new BadRequestException(
        'Search query must be 100 characters or less.',
      );
    }

    return this.sitesService.search(query);
  }

  @Get('address')
  findByAddress(@Query('address') address: string) {
    if (!address || !address.trim()) {
      throw new BadRequestException('Address is required.');
    }

    return this.sitesService.findByAddress(address);
  }

  @Post()
  create(
    @Body('address') address: string,
    @Body('title') title: string,
    @Body('html') html: string,
    @Body('author') author: string,
  ) {
    if (
      typeof address !== 'string' ||
      typeof title !== 'string' ||
      typeof html !== 'string' ||
      typeof author !== 'string'
    ) {
      throw new BadRequestException(
        'Please provide a valid address, title, HTML and publisher.',
      );
    }

    return this.sitesService.create({
      address,
      title,
      html,
      author,
    });
  }
}
