import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { PropertiesService } from '../../../providers/properties.service';
import { Common } from '../../../shared/common';
import { UserManagementService } from '../../../providers/user-management.service';
import { UtilityService } from '../../../providers/utilities.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import cloneDeep from 'lodash.clonedeep';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss'],
})
export class LiveComponent implements OnInit {

  @ViewChild(IonInfiniteScroll,{static:true}) infiniteScroll: IonInfiniteScroll;
  properties:any=[];
  userSettings;
  listingsOffset = 0;
  searchKey;
  lastSearchkey='';
  firstLoad = true;
  refreshSubscription: Subscription;

  constructor(private propertiesSrvc:PropertiesService,
    private common:Common,
    private userMgmtSrvc:UserManagementService,
    private utilityService: UtilityService,
    public navCtrl: NavController,
    private router:Router,
    private activatedRoute:ActivatedRoute,) { 
      this.userSettings = this.userMgmtSrvc.userSettings.getValue();
      this.propertiesSrvc.searchKey.subscribe(key=>{
        this.searchKey = key;
        if(this.router.url.indexOf('live')>-1 && !this.firstLoad){
          this.checkForSearchChange();
        }
      })
      this.refreshSubscription = this.propertiesSrvc.editedProperty.subscribe(res => {
        if(res){
          this.doRefresh(null);
        }
      })
    }

  ngOnInit() {
    this.propertiesSrvc.newProperty.next(null)
    // if(this.propertiesSrvc.needListingRefresh){
      // this.listingsOffset = 0;
      // this.properties=[];
      this.infiniteScroll.disabled = true;
      // this.propertiesSrvc.needListingRefresh = false;
      // this.fetchMyProperties();
    // }
  }
  ionViewWillEnter(){
    this.firstLoad = false;
    this.checkForSearchChange();
  }
  checkForSearchChange(){
    if(this.lastSearchkey !==this.searchKey){
      this.listingsOffset = 0;
      this.properties=[];
      this.lastSearchkey = cloneDeep(this.searchKey);
      this.fetchMyProperties();
    }
  }
  fetchMyProperties(ev?){
    this.common.presentLoader();
    let params={
      limit:10,
      offset:this.listingsOffset,
      visibility:'Unhide',
    }
    if(this.searchKey){
      params['searchKey'] = this.searchKey;
    }
    this.propertiesSrvc.getPropertyListingsByMe(params).toPromise().then((res:any)=>{
      if(res){
        this.properties = [...this.properties,...res];
        console.log(this.properties)
        if(res.length<10){
          //no more properties are present in server
          this.infiniteScroll.disabled = true;
        }
        else{
          this.infiniteScroll.disabled = false;
        }
      }
    }).catch(err=>{
      console.log(err)
    }).finally(()=> {
      if(ev){
        ev.target.complete();
      }
      this.common.dismissLoader()
    })
  }

  doRefresh(event){
    this.properties=[];
    this.listingsOffset = 0;
    if(this.infiniteScroll){
      this.infiniteScroll.disabled = true;
    }
    this.fetchMyProperties(event)
  }

  propertyDetail(data: any) {
    if(data && data.external_url){
      this.utilityService.openURLCapacitorBrowser(data.external_url);
      return;
    }
    this.propertiesSrvc.propertyDetail.next(data);
    this.propertiesSrvc.propertyID.next(data.id);
    let navigationExtras: NavigationExtras = {
      relativeTo:this.activatedRoute,
      queryParams:{
        id:data.id
      },
      // state: {
      //   key: 'sd_property_selected',
      //   value: data,
      // }
    };
    this.router.navigate(['../','property-detail'], navigationExtras);
    // this.navCtrl.navigateForward('property-detail');
  }
  deleteProperty(event){
    this.propertiesSrvc.deleteProperty({id:event}).toPromise().then(res=>{
      if(res=='success'){
        let index = this.properties.findIndex(el=> el.id == event)
        if(index>-1){
          this.properties.splice(index,1)
        }
        this.common.presentToast('Listing has been removed.!')
      }
      else{
        this.common.presentToast(res)
      }
    }).catch(err=> console.log(err))
  }
  editProperty(event){
    this.propertiesSrvc.newProperty.next(event)
    if(event.external_url){
      this.navCtrl.navigateForward('seller/add-url');
    }
    else {
      this.navCtrl.navigateForward('seller/detailed-listing');
    }
  }
  markAttendance(event){
    this.propertiesSrvc.propertyDetail.next(event);
    this.navCtrl.navigateForward('seller/attendance');
  }

  loadData(event){
    setTimeout(() => {
      //featured listing is present on screen
      this.listingsOffset +=10;
      this.fetchMyProperties(event)
    }, 500);
  }
  ngOnDestroy(){
    this.propertiesSrvc.searchKey.unsubscribe();
    this.refreshSubscription.unsubscribe();
  }
}
