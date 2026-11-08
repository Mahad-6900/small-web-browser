
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Site } from './site.schema.js';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: Model<Site>,
  ) {}

  async findAll() {
    return this.siteModel
      .find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByAddress(address: string) {
    const cleanAddress = address.trim().toLowerCase();

    const site = await this.siteModel
      .findOne({ address: cleanAddress })
      .populate('author', 'name')
      .exec();

    if (!site) {
      throw new NotFoundException(
        'This address does not exist in Small Web.',
      );
    }

    return site;
  }

  async search(query: string) {
    const cleanQuery = query.trim();

    const safeQuery = cleanQuery.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    return this.siteModel
      .find({
        $or: [
          { title: { $regex: safeQuery, $options: 'i' } },
          { address: { $regex: safeQuery, $options: 'i' } },
          { html: { $regex: safeQuery, $options: 'i' } },
        ],
      })
      .populate('author', 'name')
      .sort({ title: 1 })
      .limit(50)
      .exec();
  }

  async create(data: {
    address: string;
    title: string;
    html: string;
    author: string;
  }) {
    const address = data.address.trim().toLowerCase();
    const title = data.title.trim();
    const html = data.html.trim();

    if (!address || !title || !html || !data.author) {
      throw new BadRequestException(
        'Address, title, HTML and publisher are required.',
      );
    }

    if (/\s/.test(address) || address.length > 120) {
      throw new BadRequestException(
        'Address cannot contain spaces and must be under 120 characters.',
      );
    }

    if (title.length > 100) {
      throw new BadRequestException(
        'Page title must be 100 characters or less.',
      );
    }

    if (html.length > 100000) {
      throw new BadRequestException(
        'HTML content must be under 100 KB.',
      );
    }

    if (!Types.ObjectId.isValid(data.author)) {
      throw new BadRequestException('Invalid publisher.');
    }

    const existingSite = await this.siteModel.findOne({ address });

    if (existingSite) {
      throw new ConflictException(
        'This address is already taken. Please choose another address.',
      );
    }

    const createdSite = await this.siteModel.create({
      address,
      title,
      html,
      author: new Types.ObjectId(data.author),
      links: this.extractLinks(html),
    });

    return this.siteModel
      .findById(createdSite._id)
      .populate('author', 'name')
      .exec();
  }

  private extractLinks(html: string): string[] {
    const links = new Set<string>();
    const linkPattern = /href\s*=\s*["']([^"']+)["']/gi;

    let match: RegExpExecArray | null;

    while ((match = linkPattern.exec(html)) !== null) {
      const value = match[1].trim();

      if (
        value &&
        !value.startsWith('#') &&
        !/^(https?:|mailto:|javascript:|data:)/i.test(value)
      ) {
        links.add(
          value
            .split(/[?#]/)[0]
            .replace(/^\/+/, '')
            .toLowerCase(),
        );
      }
    }

    return [...links];
  }
}
