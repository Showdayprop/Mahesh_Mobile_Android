import { ProviderDetailComponent } from '../pages/dashboard/provider-detail/provider-detail.component';
import { StorageService } from './storage.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { environment } from '../../environments/environment';
import { Common } from '../shared/common';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AffiliateService {
  constructor(
    private http: HttpClient,
    private common: Common,
    private storageSrvc: StorageService) { }

  createService(params) {
    return this.http.post(environment.config.apiEndPoint + 'Affiliates/update_service', params)
  }

  removeServiceImage(params) {
    return this.http.post(environment.config.apiEndPoint + 'Affiliates/remove_image', params)
  }

  deleteService(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.delete(environment.config.apiEndPoint + 'Affiliates/delete_service' + query)
  }

  getServiceDetails(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/service_details' + query)
  }
  requestNewSubCat(params) {
    return this.http.post(environment.config.apiEndPoint + 'Affiliates/request_category', { name: params })
  }

  getServiceImages(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/service_images_' + query)
  }
  uploadImages(data) {
    return this.http.post(environment.config.apiEndPoint + 'Affiliates/upload_service_image', data)
  }
}
