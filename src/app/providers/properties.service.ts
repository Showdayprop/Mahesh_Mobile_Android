import { StorageService } from './storage.service';
import { Common } from './../shared/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import cloneDeep from 'lodash.clonedeep';

@Injectable({
    providedIn: 'root'
})
export class PropertiesService {
    propertyData: any;
    public propertyDetail = new BehaviorSubject({});
    public propertyID = new BehaviorSubject(null);
    public newProperty = new BehaviorSubject({});
    public searchKey = new BehaviorSubject(null);
    public editedProperty = new BehaviorSubject(null);
    needListingRefresh: boolean = true;
    userFavsIds = [];

    constructor(
        public http: HttpClient,
        private common: Common,
        private storageSrvc: StorageService
    ) {
        this.storageSrvc.getObject('userFav').then(d => {
            if (!d) {
                d = []
            }
            this.userFavsIds = cloneDeep(d);
        })
    }

    showday(filterAreas,
        requirement,
        minimumPrice,
        maximumPrice,
        houseType,
        noBedrooms,
        noBathrooms,
        limit, offset, type?): Observable<any> {
        const params: any = {};
        params.filter_areas = filterAreas.join(',');
        params.requirement = requirement;
        params.limit = limit;
        params.offset = offset;

        if (minimumPrice) {
            params.minimum_price = minimumPrice;
        }

        if (maximumPrice) {
            params.maximum_price = maximumPrice;
        }

        if (noBedrooms) {
            params.num_bedrooms = noBedrooms;
        }

        if (noBathrooms) {
            params.num_bathrooms = noBathrooms;
        }

        if (houseType) {
            params.house_type = houseType.join('~');
        }
        if (type) {
            params.type = type;
        }

        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/showdays' + query)
    }

    savePropertyFilters(filterObj: any): Observable<any> {

        return this.http.post(environment.config.apiEndPoint + 'AppPreferences/set_property_preferences',
            filterObj).pipe(
                map(this.extractData),
                catchError(this.handleError)
            );
    }

    save(data) {
        this.propertyData = data;
    }

    get() {
        return this.propertyData;
    }

    // Private
    private extractData(res: Response) {
        const body = res;
        return body || {};
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const err = error || '';
            errMsg = `${error}`;
        } else {
            errMsg = error.error;
        }

        return throwError(errMsg);
    }

    getFeaturedOrNearMeProperties(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/properties' + query)
    }
    getPropertyImages(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/property_images' + query)
    }

    getSimilarProperties(params) {
        return this.http.post(environment.config.apiEndPoint + 'PropertyRequests/similar_properties', params)
    }
    
    getPropertyListingsByMe(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/user_properties' + query)
    }

    getPropertyListingsByMeCount(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/user_properties_count' + query)
    }

    createPropertyWithURL(data) {
        return this.http.post(environment.config.apiEndPoint + 'PropertyRequests/external_url_create', data)
    }

    addPropertyCoordinates(data) {
        return this.http.post(environment.config.apiEndPoint + 'PropertyRequests/add_property_coordinates', data)
    }
    createDetailedListing(data) {
        return this.http.post(environment.config.apiEndPoint + 'PropertyRequests/detailed_listing_marketing_info', data)
    }
    updatePropertySpecs(data) {
        return this.http.post(environment.config.apiEndPoint + 'PropertyRequests/update_property_specs', data)
    }
    deleteImage(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/remove_img' + query)
    }
    changePropertyVisibility(data) {
        return this.http.post(environment.config.apiEndPoint + 'PropertyRequests/change_property_visibility', data)
    }
    deleteProperty(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/remove_property' + query)
    }
    getPropertyDetailsByID(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/property_by_id' + query)
    }

    getPropertyURL(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/generate_property_url' + query)
    }

    updateImageOrder(data) {
        return this.http.post(environment.config.apiEndPoint + 'PropertyRequests/update_image_order', data)
    }

    addToFav(id) {
        this.userFavsIds.push(id);
        this.http.post(environment.config.apiEndPoint + 'PropertyRequests/add_to_fav', { property_id: id }).toPromise().then(res => {
            console.log(res)
            if (res == 'full') {
                this.userFavsIds.splice(this.userFavsIds.indexOf(id), 1);
                this.common.presentToast('You cannot add more than 20 listings to favourites.')
            }
            else {
                this.common.presentToast('Listing has been added to your favourites.')
            }
            this.storageSrvc.setObject('userFav', this.userFavsIds);
        }).catch(err => {
            this.userFavsIds.splice(this.userFavsIds.indexOf(id), 1);
        })
    }

    removeFromFav(id) {
        this.userFavsIds.splice(this.userFavsIds.indexOf(id), 1);
        this.http.post(environment.config.apiEndPoint + 'PropertyRequests/remove_from_fav', { property_id: id }).toPromise().then(res => {
            console.log(res)
            this.storageSrvc.setObject('userFav', this.userFavsIds);
            this.common.presentToast('Listing has been remove from your favourites.')
        }).catch(err => {
            this.userFavsIds.push(id);
        })
    }

    getUserFavsIds() {
        this.http.get(environment.config.apiEndPoint + 'PropertyRequests/user_favs_id').toPromise().then(res => {
            if (res) {
                this.userFavsIds = cloneDeep(res);
                this.storageSrvc.setObject('userFav', res);
            }
        })
    }

    getUserFavsFull() {
        return this.http.get(environment.config.apiEndPoint + 'PropertyRequests/user_favs_full')
    }

}
