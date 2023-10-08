import { LoggerService } from './../core/logger.service';
import { NotificationService } from './../providers/notification.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ResolverInterface } from '../interfaces/resolver-interface';
import { Common } from '../shared/common';
import { UserManagementService } from '../providers/user-management.service';


@Injectable()
export class AlertPreferences implements ResolverInterface<any> {
    id: any;
    userData;
    constructor(
        private userMgmtSrvc:UserManagementService,
        private notifcationSrvc: NotificationService,
        private logger:LoggerService
    ) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        this.userData = this.userMgmtSrvc.user.getValue();
        if(!this.userData.isLoggedIn){

        }
        // let dummy = of(JSON.parse('{"requirement":"sale","areas":["10"],"selectedAreas":[{"area":"Sunninghill","area_id":"10","city_id":"48348","city":"Sandton","state_id":"4123","state":"Gauteng","country_id":"202","c_code":"ZA"}],"type_of_property":["house","commercial"],"minimum_price":100000,"maximum_price":7000000,"no_bedrooms":2,"no_bathrooms":4}'))
        // return dummy;
        this.logger.log('alertPreferenceResolver');
        return this.notifcationSrvc.getAlertPreferences().pipe(take(1))
    }
}
