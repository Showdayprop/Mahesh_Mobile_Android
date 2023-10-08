import { Common } from './../shared/common';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalConfigService } from './global-config.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  propertyEvents = new BehaviorSubject(null);
  constructor(private storageSrvc: StorageService,
    private http: HttpClient,
    private common: Common,
    private globalConfigSrvc: GlobalConfigService) {
  }

  updateEvents(events) {
    if (!events) {
      this.storageSrvc.removeItem('events')
      this.propertyEvents.next(null);
      return;
    }
    this.storageSrvc.setObject('events', events);
    this.propertyEvents.next(events);
  }

  addEvent(data) {
    return this.http.post(environment.config.apiEndPoint + 'ShowdayEvents/add_or_update_events', data)
  }

  deleteEvent(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'ShowdayEvents/remove_event' + query)
  }

  updateEvent(data) {
    return this.http.post(environment.config.apiEndPoint + 'ShowdayEvents/add_or_update_events', data)
  }

  fetchPropertEvents(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'ShowdayEvents/property_events' + query)
  }

}
