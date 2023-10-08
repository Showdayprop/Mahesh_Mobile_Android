import { Common } from './../../../shared/common';
import { TrackerService } from './../../../providers/tracker.service';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { CreateComponent } from '../create/create.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {

  list: any = [];
  meta: any;
  isLoading = false;
  searchText;
  pageSubscription = new Subscription();
  constructor(private trackerSrvc: TrackerService,
    private common: Common,
    private modalCtrl: ModalController,
    private navCtrl: NavController) {
    this.pageSubscription.add(this.trackerSrvc.needsRefresh$.subscribe(x => {
      if(x) this.fetchList({},true);
    }))
  }

  ngOnInit() {
    this.fetchList();
  }
  fetchList(params?,reset?) {
    // this.common.presentLoader();
    this.isLoading = true;
    this.trackerSrvc.getList(params).toPromise().then(res => {
      if (res && res['list']) this.list = res['list'];
      if(res && res['meta']) this.meta = res['meta']
    }).finally(() => {
      // this.common.dismissLoader();
      this.isLoading = false;
      if (reset) {
        this.trackerSrvc.needsRefresh$.next(false)
      }
    })
  }
  sold(item) {
    item['sold'] = item['sold'] == 1 ? 0 : 1
    this.edit(item,true)
  }

  async edit(item,markedSold?) {
    const modal = await this.modalCtrl.create({
      component: CreateComponent,
      componentProps:{item}
    })
    modal.onDidDismiss().then(d => {
      if (d && d.data) {
        this.fetchList()
      }
      else if(markedSold) item['sold'] = item['sold'] == 1 ? 0 : 1
    })
    return await modal.present()
  }

  delete(item,i) {
    this.common.presentLoader();
    this.trackerSrvc.deleteSet({ id: item.id }).toPromise().then(res => {
      if (res) {
        this.list.splice(i, 1);
        this.common.presentToast('Tracker set has been deleted')
        if (item.sold == 1) this.meta.sold -= 1
        this.meta.total -=1
      }
    }).finally(()=>this.common.dismissLoader())
  }

  detail(item) {
    this.trackerSrvc.detailObj$.next(item);
    this.navCtrl.navigateForward('/tracker/detail')
  }
  searchbarInteraction(value) {
    let params={};
    if (value && value != "") {
      if (isNaN(value)) params['search_area'] = value
      else params['search_ref'] = value;
    }
    this.fetchList(params)
  }
  clearSearch() {
    // delete this.searchText;
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.pageSubscription.unsubscribe()
  }
}
