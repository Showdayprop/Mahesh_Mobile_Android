import { ProviderDetailComponent } from './../pages/dashboard/provider-detail/provider-detail.component';
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
export class DirectoryService {
  directoryCategories = new BehaviorSubject(null);
  selectedCategory;
  serviceCoordinates;
  doServiceListRefresh: boolean;
  constructor(
    private http: HttpClient,
    private common: Common,
    private storageSrvc: StorageService) { }
  // getCategories() {
  //   return this.http.get(environment.config.apiEndPoint + 'Affiliates/categories')
  // }
  async getCategories(): Promise<any> {
    return await new Promise((resolve, reject) => {
      this.http.get(environment.config.apiEndPoint + 'Affiliates/categories').toPromise().then(res => {
        // this.directoryCategories.next(res);
        this.storageSrvc.setObject('categories', res)
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    });
  }

  getAffiliates(params) {
    return this.http.post(environment.config.apiEndPoint + 'Affiliates/list_affiliates', params)
  }
  searchAffiliates(searchText, countryCode) {
    let params = new HttpParams().set('search_str', searchText)
      .set('country_code', countryCode);
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/search_affiliates', { params })
  }

  getMarkerLocations(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/marker_locations' + query)
  }

  getLocationServices(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/location_services' + query)
  }

  getServicesForProvider(params?) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/services_for_provider' + query)
  }

  getCalculatedCategories(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/calculate_categories' + query)
  }

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

  getServiceProviderDetails(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/service_provider_detail' + query)
  }

  getServiceImages(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Affiliates/service_images' + query)
  }

  uploadImages(data) {
    return this.http.post(environment.config.apiEndPoint + 'Affiliates/upload_multiple_service_image', data)
  }

  updateServiceImages(data) {
    return this.http.post(environment.config.apiEndPoint + 'Affiliates/update_service_images', data)
  }

  deleteImage(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
      query = '?' + query;
    }
    return this.http.delete(environment.config.apiEndPoint + 'Affiliates/delete_service_image' + query)
  }
}
