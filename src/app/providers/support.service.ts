import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Common } from './../shared/common';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
// import { HTTP } from '@ionic-native/http/ngx';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(private common:Common, private http:HttpClient) { }

  requestAdminForAccess(dataObj){

    return this.http.post(environment.config.apiWebEndPoint + 'ContactPageController/account_access_request',dataObj)
    // return this.http.post("http://localhost/public_html/index.php/" + 'ContactPageController/account_access_request',dataObj)
  }
}
