import { UtilityService } from './../../providers/utilities.service';
import { PropertiesService } from './../../providers/properties.service';
import { Common } from './../../shared/common';
import { NotificationService } from './../../providers/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, IonInfiniteScroll } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Plugins, PermissionType } from '@capacitor/core';
const { Permissions } = Plugins;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  @ViewChild(IonInfiniteScroll,{static:true}) infiniteScroll: IonInfiniteScroll;

  offset = 0;
  notifications:any=[];
  disableMarkAllRead:boolean = false;
  hasPermission = true;
  constructor(private navCtrl :NavController,
    private activatedRoute:ActivatedRoute,
    private notificationSrvc: NotificationService,
    private common:Common,
    private propertiesSrvc:PropertiesService,
    private utilityService:UtilityService,
    private router:Router) {
      this.fetchNotifications(false);
      Permissions.query({name:PermissionType.Notifications}).then(has=>{
        if(has.state !='granted'){
          this.hasPermission = false;
        }
      })
  }

  ngOnInit() {
  }
  
  fetchNotifications(loadMore,ev?){
    this.common.presentLoader();
    this.notificationSrvc.getNotificationHistoryOrCount({
      limit:20,
      offset:this.offset
    }).toPromise().then((res:any)=>{
      if(loadMore){
        this.notifications = [...this.notifications,...res]
      }
      else{
        this.notifications = res;
      }
      this.disableMarkAllRead = this.notifications.filter(el=>el.is_read==0).length == 0;
      if(res.length < 20){
        //no more properties are present in server
        this.infiniteScroll.disabled = true;
      }
      else{
        this.infiniteScroll.disabled = false;
      }

      if(ev){
        ev.target.complete();
      }
    }).catch(err=>{
      console.log(err)
    }).finally(()=>this.common.dismissLoader())
  }
  doRefresh(event){
    this.notifications=[];
    this.offset = 0;
    this.fetchNotifications(false,event);
  }
  loadData(event){
    this.offset +=20;
    this.fetchNotifications(true,event);
  }

  markAllRead(){
    this.common.presentAlertForConfirmation('Are you sure you want to mark all notifications as read?').then(()=>{
      this.notificationSrvc.markAsRead({}).toPromise().then(res=>{
        this.notifications = this.notifications.map(el => {
          el.is_read = 1;
          return el;
        })
        this.disableMarkAllRead = true;
      })
    })
  }

  markOneRead(id,index){
    this.notificationSrvc.markAsRead({id:id}).toPromise().then(res=>{
      this.notifications[index].is_read = 1;
    })
    this.common.presentLoader();
    this.propertiesSrvc.getPropertyDetailsByID({id:id}).toPromise().then((res:any)=>{
      if(res){
        if(res.external_url){
          this.utilityService.openURLCapacitorBrowser(res.external_url);
          return;
        }
        this.propertiesSrvc.propertyDetail.next(res);
        this.propertiesSrvc.propertyID.next(res.id);
        this.router.navigate(['../','property-detail'], {
          relativeTo:this.activatedRoute,
          queryParams:{
            id:res.id
          },
          // state: {
          //   key: 'sd_property_selected',
          //   value: res,
          // }
        });
      }
    }).finally(()=>{
      this.common.dismissLoader();
    })
  }
}
