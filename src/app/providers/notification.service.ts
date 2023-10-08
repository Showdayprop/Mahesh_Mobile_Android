import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Common } from '../shared/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notificationCount = new BehaviorSubject(0);
  public notificationData$ = new BehaviorSubject<any>(null);
  constructor(private common:Common, private http:HttpClient) { }
  testPushNotificationSrvc(params){
    let query = this.common.obToquery(params);
    if (query !== '') {
        query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Utils/fcm'+query)
  }

  getAlertPreferences(){
    return this.http.get(environment.config.apiEndPoint + 'AppPreferences/property_preferences')
  }

  setAlertPreferences(params){
    return this.http.post(environment.config.apiEndPoint + 'AppPreferences/set_property_preferences',params)
  }

  toggleAlertPreferences(params?){
    return this.http.post(environment.config.apiEndPoint + 'AppPreferences/toggle_preference',params)
  }

  getNotificationHistoryOrCount(params){
    let query = this.common.obToquery(params);
    if (query !== '') {
        query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'NotificationsCenter/notification_history'+query)
  }
  setPushToken(params){
    return this.http.post(environment.config.apiEndPoint + 'NotificationsCenter/set_push_token',params)
  }
  markAsRead(params){
    return this.http.post(environment.config.apiEndPoint + 'NotificationsCenter/mark_read',params)
  }

  refreshNotificationsCount(){
    this.getNotificationHistoryOrCount({get_count:true}).toPromise().then(res=>{
      if(res){
        this.notificationCount.next(Number(res));
      }
    })
  }
}
