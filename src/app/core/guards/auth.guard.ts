import { UserManagementService } from './../../providers/user-management.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Common } from '../../shared/common';
import { GlobalConfigService } from '../../providers/global-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private globalConfigSrvc: GlobalConfigService, private router: Router,
    private common: Common, private userMgmtSrvc:UserManagementService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.globalConfigSrvc.authToken) {
      return true;
    }
    else if (route.routeConfig.path == 'chat') {
      // user is trying to access chat, show the login/mobile modal
      let user = this.userMgmtSrvc.user.getValue()
      // if (user && user['contact_number']) return true
      // else {
        this.router.navigate(['/capture-mobile'], { replaceUrl: true })
        return false;
      // }
    }
    else {
      // no auth Token, so user not logged in
      this.common.presentToast('Please Login to use this feature', 'Login Required', 5000)
      this.router.navigate(['/login'], { replaceUrl: true })
      return false;
    }
  }

}
