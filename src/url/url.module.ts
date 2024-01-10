import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { UrlRepo } from './url.repo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationProcessor } from 'src/webhook/notification-processor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 120000,
      max: 1000
    }),
    EventEmitterModule.forRoot()
  ],
  controllers: [UrlController],
  providers: [UrlRepo, UrlService, NotificationProcessor],
})
export class UrlModule { }
