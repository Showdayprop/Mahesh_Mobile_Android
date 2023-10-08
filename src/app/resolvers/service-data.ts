import { DirectoryService } from './../providers/directory.service';
import { LoggerService } from '../core/logger.service';
import { NotificationService } from '../providers/notification.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ResolverInterface } from '../interfaces/resolver-interface';
import { Common } from '../shared/common';
import { UserManagementService } from '../providers/user-management.service';


@Injectable()
export class ServiceData implements ResolverInterface<any> {
    id: any;
    userData;
    constructor(
        private directorySrvc: DirectoryService
    ) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        if (route.queryParams.id) {
            return this.directorySrvc.getServiceDetails({ id: route.queryParams.id }).pipe(take(1))
        }
        else return null
    }
}
