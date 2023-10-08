import { Common } from './../shared/common';
import { StorageService } from './storage.service';
import { PropertiesService } from './properties.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { shareReplay, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import cloneDeep from 'lodash.clonedeep';
import { Plugins } from '@capacitor/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { Deploy } from 'cordova-plugin-ionic/dist/ngx';

const { Browser } = Plugins;
const CACHE_SIZE = 1;

@Injectable({
    providedIn: 'root'
})
export class UtilityService {
    locationInfo: any;
    functionalTypes;
    private fnCache$: Observable<any>;
    private rqCache$: Observable<any>;
    private htCache$: Observable<any>;
    private stCache$: Observable<any>;

    private cityCache$: string[] = [];
    private areaCache$: string[] = [];
    areaSearchResults = new BehaviorSubject({})
    mapsLoaded: boolean = false;
    houseTypes;
    requirements;
    mandateTypes;
    updateProgress$ = new BehaviorSubject('')


    options: InAppBrowserOptions = {
        location: 'no',//Or 'no' 
        hidden: 'no', //Or  'yes'
        clearcache: 'yes',
        clearsessioncache: 'yes',
        zoom: 'yes',//Android only ,shows browser zoom controls 
        hardwareback: 'yes',
        mediaPlaybackRequiresUserAction: 'no',
        shouldPauseOnSuspend: 'no', //Android only 
        closebuttoncaption: 'Back', //iOS only
        disallowoverscroll: 'no', //iOS only 
        toolbar: 'yes', //iOS only 
        enableViewportScale: 'no', //iOS only 
        allowInlineMediaPlayback: 'no',//iOS only 
        fullscreen: 'yes',//Windows only
        hidenavigationbuttons: 'yes',
    };

    constructor(
        public http: HttpClient,
        private nativeGeocoder: NativeGeocoder,
        private geolocation: Geolocation,
        private theInAppBrowser: InAppBrowser,
        private firebaseDynamicLinks: FirebaseDynamicLinks,
        private propertiesSrvc: PropertiesService,
        private storageSrvc: StorageService,
        private common: Common,
        private deploy: Deploy
    ) {

        this.deploy.getAvailableVersions().then(d=>console.log(d));
    }

    /* async checkForLiveDeployUpdate() {
        const update = await this.deploy.checkForUpdate()
        if (update.available){
        // We have an update!
            await this.deploy.downloadUpdate((progress) => {
                console.log(progress);
            })
            await this.deploy.extractUpdate((progress) => {
                console.log(progress);
            })
            await this.deploy.reloadApp()
        }
    }*/

    async performAutomaticUpdate() {
        try {
            // const currentVersion = await this.deploy.getCurrentVersion();
            const update = await this.deploy.checkForUpdate();
            // console.log(`CurrentVersion ${currentVersion}`)
            // console.log(`Update ${update}`)
            // await this.deploy.downloadUpdate((progress) => {
            //     console.log(`Progress ${progress}`);
            //     this.updateProgress$.next(progress)
            // })
            if (update) {
                this.updateProgress$.next('Update In Progress');
                const resp = await this.deploy.sync({updateMethod: 'auto'}, percentDone => {
                    console.log(`Update is ${percentDone}% done!`);
                    this.updateProgress$.next('Done')
                });
            }
            /*if (!currentVersion || currentVersion.versionId !== resp.versionId){
                // We found an update, and are in process of redirecting you since you put auto!
            }else{
                // No update available
            } */
        } catch (err) {
            // We encountered an error.
        }
    }
    
    getFunctionalTypes() {
        return this.http.get(environment.config.apiEndPoint + 'Utils/functional_types')
    }

    async getRequirements(): Promise<any> {
        return await new Promise((resolve, reject) => {
            this.http.get(environment.config.apiEndPoint + 'Utils/property_requirements_config').toPromise().then(res => {
                this.requirements = res;
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        });
    }
    async getHouseTypes(): Promise<any> {
        return await new Promise((resolve, reject) => {
            this.http.get(environment.config.apiEndPoint + 'Utils/house_types_config').toPromise().then(res => {
                this.houseTypes = res;
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        });
    }
    getStatesByCountry(countryCode: string): Observable<any> {
        if (!this.stCache$) {
            const params = new HttpParams()
                .set('country', countryCode);

            this.stCache$ = this.http.get(environment.config.apiEndPoint + 'Utils/states', { params }).pipe(
                map(this.extractData),
                catchError(this.handleError)
            ).pipe(
                shareReplay(CACHE_SIZE)
            );
        }

        return this.stCache$;
    }

    getCities(stateId: string): Observable<any> {
        if (this.cityCache$ && !this.cityCache$[stateId]) {
            const params = new HttpParams()
                .set('s_id', stateId);

            this.cityCache$[stateId] = this.http.get(environment.config.apiEndPoint + 'Utils/city_dropdown_by_state',
                { params }).pipe(
                    map(this.extractData),
                    catchError(this.handleError)
                ).pipe(
                    shareReplay(CACHE_SIZE)
                );
        }

        return this.cityCache$[stateId];
    }

    getAreas(cityId: string): Observable<any> {
        if (this.areaCache$ && !this.areaCache$[cityId]) {
            const params = new HttpParams()
                .set('c_id', cityId)
                .set('search_str', 'keyword');

            this.areaCache$[cityId] = this.http.get(environment.config.apiEndPoint + 'Utils/areas_filter', { params }).pipe(
                map(this.extractData),
                catchError(this.handleError)
            ).pipe(
                shareReplay(CACHE_SIZE)
            );
        }

        return this.areaCache$[cityId];
    }
    searchAreas(searchText, countryCode, estates?) {
        let params = new HttpParams().set('search_str', searchText)
            .set('country_code', countryCode);
        if (estates) {
            params = params.append('estates', 'true')
        }
        return this.http.get(environment.config.apiEndPoint + 'Utils/areas_search', { params })
    }

    setLocationData(data) {
        this.locationInfo = data;
    }

    getLocationData() {
        return this.locationInfo;
    }

    refreshLocationData() {
        this.geolocation.getCurrentPosition().then(geoResponse => {
            this.locationInfo = cloneDeep(geoResponse.coords);
            this.nativeGeocoder.reverseGeocode(geoResponse.coords.latitude, geoResponse.coords.longitude, {
                useLocale: true,
                maxResults: 5
            }).then((result: NativeGeocoderResult[]) => {
                this.locationInfo = cloneDeep(result[0]);
                return this.locationInfo
            })
                .catch((error: any) => console.log(error));
        });
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

    async capacitorBrowserPrefetch(urls) {
        Browser.prefetch({ urls: [urls] });
    }
    async openURLCapacitorBrowser(url) {
        await Browser.open({ url: url });
    }

    public openWithSystemBrowser(url: string) {
        let target = "_system";
        this.theInAppBrowser.create(url, target, this.options);
    }
    public openWithInAppBrowser(url: string) {
        let target = "_blank";
        this.theInAppBrowser.create(url, target, this.options);
    }
    public openWithCordovaBrowser(url: string) {
        let target = "_self";
        this.theInAppBrowser.create(url, target, this.options);
    }

    async createDynamicLinkForProperty(propertyId, isSeller?) {
        try {
            const url = await this.propertiesSrvc.getPropertyURL({ id: propertyId }).toPromise();
            let finalUrl = url.toString()
            if (isSeller) {
                finalUrl += '?type=joint'
            }
            console.log(finalUrl);
            let opts = {
                domainUriPrefix: environment.config.deepLinkPrefix,
                link: encodeURI(finalUrl),
                androidInfo: {
                    androidPackageName: environment.config.appIdentifier
                },
                iosInfo: {
                    iosBundleId: environment.config.appIdentifier,
                    iosAppStoreId: environment.config.iosAppStoreId,
                },
                analyticsInfo: {

                }
            }
            console.log(opts)
            try {
                return await this.firebaseDynamicLinks.createShortDynamicLink(opts)
            }
            catch (error) {
                console.log(error)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    async createDynamicLinkForPropertyVideo(propertyId) {
        try {
            let url = await this.propertiesSrvc.getPropertyURL({ id: propertyId }).toPromise();
            url = url + "#video"
            console.log(url.toString());
            let opts = {
                domainUriPrefix: environment.config.deepLinkPrefix,
                link: encodeURI(url.toString()),
                androidInfo: {
                    androidPackageName: environment.config.appIdentifier
                },
                iosInfo: {
                    iosBundleId: environment.config.appIdentifier,
                    iosAppStoreId: environment.config.iosAppStoreId,
                },
                analyticsInfo: {

                }
            }
            console.log(opts)
            try {
                return await this.firebaseDynamicLinks.createShortDynamicLink(opts)
            }
            catch (error) {
                console.log(error)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    async createDynamicLinkForPropertyModel(propertyId) {
        try {
            let url = await this.propertiesSrvc.getPropertyURL({ id: propertyId }).toPromise();
            url = url + "#model"
            console.log(url.toString());
            let opts = {
                domainUriPrefix: environment.config.deepLinkPrefix,
                link: encodeURI(url.toString()),
                androidInfo: {
                    androidPackageName: environment.config.appIdentifier
                },
                iosInfo: {
                    iosBundleId: environment.config.appIdentifier,
                    iosAppStoreId: environment.config.iosAppStoreId,
                },
                analyticsInfo: {

                }
            }
            console.log(opts)
            try {
                return await this.firebaseDynamicLinks.createShortDynamicLink(opts)
            }
            catch (error) {
                console.log(error)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    async createDynamicLinkForCalculator(name, data) {
        try {
            const url = environment.config.apiEndPoint + "calculator/" + name + "/data/" + data;
            console.log(url.toString());
            let opts = {
                domainUriPrefix: environment.config.deepLinkPrefix,
                link: encodeURI(url.toString()),
                androidInfo: {
                    androidPackageName: environment.config.appIdentifier
                },
                iosInfo: {
                    iosBundleId: environment.config.appIdentifier,
                    iosAppStoreId: environment.config.iosAppStoreId,
                },
                analyticsInfo: {

                }
            }
            console.log(opts)
            try {
                return await this.firebaseDynamicLinks.createShortDynamicLink(opts)
            }
            catch (error) {
                console.log(error)
            }
        }
        catch (error) {
            console.log(error)
        }
    }
    getMandateTypes() {
        this.storageSrvc.getObject('mandateTypes').then(d => {
            if (d) {
                this.mandateTypes = d;
            }
            else {
                this.http.get(environment.config.apiWebEndPoint + 'DataController/mandate_types_config').toPromise().then(data => {
                    this.mandateTypes = data;
                    this.storageSrvc.setObject('mandateTypes', data);
                }).catch(err => {
                })
            }
        })
    }

    checkForUpdate(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'Utils/app_version_check' + query)
    }

    getCurrentLocationFromServer(params) {
        let query = this.common.obToquery(params);
        if (query !== '') {
            query = '?' + query;
        }
        return this.http.get(environment.config.apiEndPoint + 'Utils/current_location' + query)
    }
    async createDynamicLinkCommon(type, value) {
        try {
            const url = environment.config.apiWebEndPoint + type + "/" + value;
            console.log(url.toString());
            let opts = {
                domainUriPrefix: environment.config.deepLinkPrefix,
                link: encodeURI(url.toString()),
                androidInfo: {
                    androidPackageName: environment.config.appIdentifier
                },
                iosInfo: {
                    iosBundleId: environment.config.appIdentifier,
                    iosAppStoreId: environment.config.iosAppStoreId,
                },
                analyticsInfo: {

                }
            }
            console.log(opts)
            try {
                return await this.firebaseDynamicLinks.createShortDynamicLink(opts)
            }
            catch (error) {
                console.log(error)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    storeDynamicLink(link, propertyId) {
        return this.http.post(environment.config.apiEndPoint + 'Utils/store_dynamic_link', { link, propertyId })
    }
}