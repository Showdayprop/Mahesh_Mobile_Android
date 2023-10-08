import { TrackerService } from './../../providers/tracker.service';
import { RouterHelperService } from './../../providers/router-helper.service';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CreateComponent } from './create/create.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.page.html',
  styleUrls: ['./tracker.page.scss'],
})
export class TrackerPage implements OnInit {
  isDetail = false;
  pageSubscriptions = new Subscription();
  constructor(private modalCtrl: ModalController,
    private routerHlprSrvc: RouterHelperService,
  private trackerSrvc:TrackerService) {
    this.pageSubscriptions.add(this.routerHlprSrvc.currentUrlSub.subscribe(v => {
      if (v && v.indexOf('/detail') > -1) {
        this.isDetail = true;
      }
      else this.isDetail = false;
    }))
  }

  ngOnInit() {
  }
  async createNew() {
    if(this.isDetail){
      return;
    }
    const modal = await this.modalCtrl.create({
      component:CreateComponent
    })
    modal.onWillDismiss().then(res => {
      this.trackerSrvc.needsRefresh$.next(true)
    })
    return await modal.present()
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.pageSubscriptions.unsubscribe()
  }
}
