import { LoggerService } from './logger.service';
import { GlobalConfigService } from './../providers/global-config.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

// This will inject api key to all request header.
// NOTE: this is only work if we use httpclient module from angular/common/http
@Injectable()
export class KeyInterceptor implements HttpInterceptor {
  public access_token='';
  constructor(private globalConst : GlobalConfigService,
    private logger:LoggerService) {
    
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let newHeader:any={}
    if(this.globalConst.deviceInfo && this.globalConst.deviceInfo.uuid){
      newHeader['Device-Id'] = this.globalConst.deviceInfo.uuid?this.globalConst.deviceInfo.uuid:''
    }
    if (this.globalConst.authToken) {
      newHeader['Authorization-Key'] =this.globalConst.authToken;
    }
    request = request.clone({
      setHeaders: newHeader
    });
    this.logger.log(request.method,": URL :", request.url)
    if(request.method == "POST"){
      this.logger.log("REQ_BODY :", request.body)
    }
    return next.handle(request);
  }
}