import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UrlRepo } from 'src/url/url.repo';

@Injectable()
export class NotificationProcessor {

  // TODO: add a scheduler to process failed event
  // run at configrable interval , for ex: every 1 hr
  failedWebHookNotifications = new Map<string, any>();

  // TODO: add a subscription endpoint
  // client needs to subscribe for webhook notifications by providing webhook url
  webHookUrls: Map<string, string> = new Map([
      ["client1","https://webhook.site/8eebeb6b-e022-41c2-9fea-1ff91df34aeb"]
  ]);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly urlRepo: UrlRepo,
    private readonly httpService: HttpService, ) {}
    
  @OnEvent('create.shortUrl', { async : true})
  async handleCreateShortUrlEvent(data: any) {
    
    console.log(data.url);

    const cacheVal = await this.cacheManager.get(data.url);
    if (cacheVal) {
      this.sendWebHookNotification(cacheVal, data.clientId);
      return;
    }

    const code = await this.urlRepo.getByUrl(data.url)
    if (code) {
      await this.cacheManager.set(data.url, code);
      this.sendWebHookNotification(code, data.clientId);
      return ;
    }

    const shortUrlCode = await this.urlRepo.createShortUrlCode(data.url);
  
    await this.cacheManager.set(data.url, shortUrlCode);
   
    await this.sendWebHookNotification(shortUrlCode, data.url, data.clientId);
  }

  // setting client1 as default if header is not set
  async sendWebHookNotification(code, url, clientId = "client1", retries = 3, backoff = 300) {

    const data = { "url": url, "shortenedURL": `http://localhost:3000/url/${code}` };
    this.httpService 
      .post(this.webHookUrls.get(clientId), data) 
      .subscribe({ 
        complete: () => { 
          console.log(`webhook notification sent to ${clientId}`); 
        }, 
        error: (err) => { 
          if(retries > 0) {
            console.log('retrying...'); 
            setTimeout(() => {
              return this.sendWebHookNotification(code, clientId, url, retries - 1, backoff * 2)
            }, backoff)
          }else{
            this.failedWebHookNotifications.set(clientId, data);
            console.log(this.failedWebHookNotifications);
          }
        }, 
      }); 
  }
}