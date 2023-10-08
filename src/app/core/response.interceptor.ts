import { LoggerService } from './logger.service';
import { GlobalConfigService } from '../providers/global-config.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { tap } from 'rxjs/operators';

// This will intercept the response from the apis and then add it to the logs
// NOTE: this is only work if we use httpclient module from angular/common/http
@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  constructor(private logger : LoggerService) {
    
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.logger.log("Status :",event.status,": URL :",event.url)
          if(event.body && !(event.body.length && event.body.length>1)){
            this.logger.log("RES_BODY :",event.body)
          }
          // analytics.logEvent({name:'API_Call',params:{
          //   apiURL:'event.url',
          //   statusText:event.statusText,
          //   response:'JSON.stringify(event.body,null,2)'
          //   }})
          // this.logger.log()
        }
        return event;
    }));

  }

}