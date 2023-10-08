import { PropertiesService } from './../../providers/properties.service';
import { UserManagementService } from './../../providers/user-management.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {
  userSettings;
  properties:any=[];

  constructor(public userMgmtSrvc:UserManagementService,
    private propertiesSrvc:PropertiesService) {
    this.userSettings = this.userMgmtSrvc.userSettings.getValue();
  }

  ngOnInit() {

    this.propertiesSrvc.getUserFavsFull().toPromise().then(res=>{
      this.properties = res;
    })
  }

}
