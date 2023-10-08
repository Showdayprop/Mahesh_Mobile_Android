import { Component, OnInit } from '@angular/core';
import { PropertiesService } from '../../providers/properties.service';
import { UserManagementService } from '../../providers/user-management.service';

@Component({
  selector: 'app-calculators',
  templateUrl: './calculators.page.html',
  styleUrls: ['./calculators.page.scss'],
})
export class CalculatorsPage implements OnInit {

  userSettings;
  properties: any = [];

  constructor(public userMgmtSrvc: UserManagementService,
    private propertiesSrvc: PropertiesService) {
    this.userSettings = this.userMgmtSrvc.userSettings.getValue();
  }

  ngOnInit() {

    // this.propertiesSrvc.getUserFavsFull().toPromise().then(res=>{
    //   this.properties = res;
    // })
  }

}
