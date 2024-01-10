import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTinyUrlDto } from './dto/create-tiny-url.dto';
import { isURL } from 'class-validator';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { UrlRepo } from './url.repo';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class UrlService {


  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly urlRepo: UrlRepo,
    private eventEmitter: EventEmitter2
  ) { }


  async create(createTinyUrlDto: CreateTinyUrlDto, clientId: string) {

    const url = createTinyUrlDto.url;
    if (!isURL(url)) {
      throw new BadRequestException('input must be a valid url')
    }

    this.eventEmitter.emit('create.shortUrl',{ "url": url , "clientId": clientId});
    return 'Request accepted';
  }

  async findOne(code: string) {

    const url = await this.urlRepo.getByShortUrlCode(code);
    if (url) {
      return url;
    }
    throw new NotFoundException(`${code} not found`);
  }
}
