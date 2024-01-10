import { Controller, Get, Post, Body, Param, Res, HttpCode, Headers } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateTinyUrlDto } from './dto/create-tiny-url.dto';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) { }

  @Post()
  @HttpCode(200)
  create(@Body() createTinyUrlDto: CreateTinyUrlDto,
    @Headers('x-client-id') clientId: string) {
    
      return this.urlService.create(createTinyUrlDto, clientId);
  }

  @Get(':id')
  async findOne(@Res() res, @Param('id') id: string) {

    const url = await this.urlService.findOne(id);
    return res.send(url);
    //return res.redirect(url)
  }
}
