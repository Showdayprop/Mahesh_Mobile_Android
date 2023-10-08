import { PropertiesService } from './../../providers/properties.service';
import { Common } from './../../shared/common';
import { UserManagementService } from './../../providers/user-management.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fav',
  templateUrl: './fav.component.html',
  styleUrls: ['./fav.component.scss'],
})
export class FavComponent implements OnInit {
  @Input() id:any;
  constructor(private userMgmtSrvc: UserManagementService,
    private common:Common,
    public propertiesSrvc:PropertiesService) { 
  }

  ngOnInit() {}
  onClick(){
    if(!this.userMgmtSrvc.isLoggedIn){
      this.common.presentPopupAlertForOK('You should be logged in to add properties to favourites.','Alert');
      return;
    }
    else if(this.propertiesSrvc.userFavsIds.indexOf(this.id)>-1){
      this.propertiesSrvc.removeFromFav(this.id)
    }
    else{
      this.propertiesSrvc.addToFav(this.id);
    }
  }
}
