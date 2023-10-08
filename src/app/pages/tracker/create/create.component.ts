import { TrackerService } from './../../../providers/tracker.service';
import { Common } from './../../../shared/common';
import { UtilityService } from './../../../providers/utilities.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams, PopoverController } from '@ionic/angular';
import { SearchPopoverListComponent } from '../../../components/search-popover-list/search-popover-list.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  form: FormGroup;
  maxDate;
  minDate;
  searchKey;
  popoverFlag: boolean = false;
  selectedAreas: any;
  editData;
  constructor(private modalCtrL: ModalController,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private popoverCtrl: PopoverController,
  public common:Common,
    private trackerSrvc: TrackerService,
  private navParams:NavParams) {
    let d = new Date();
    let month = d.getMonth();
    d.setMonth(month+1)
    this.maxDate = (d).toISOString().split('T')[0];
    d.setMonth(month-6)
    this.minDate = (d).toISOString().split('T')[0];
    if (this.navParams.get('item')) {
      this.editData = this.navParams.get('item')
    }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: [''],
      initial_price: [],
      lowest_price:[],
      listed_on: [(new Date()).toISOString().split('T')[0]],
      sold: [false],
      ref_no:[],
      sold_on: [],
      sqm_undercover: [],
      levies:[]
    })
    if (this.editData) {
      this.form.controls.title.setValue(this.editData['title'])
      if (this.editData['initial_price']) {
        let p = this.common.format(this.editData['initial_price'])
        this.form.controls.initial_price.setValue(p) 
      }
      if(this.editData['lowest_price']) {
        let p = this.common.format(this.editData['lowest_price'])
         this.form.controls.lowest_price.setValue(p)
      }
      if(this.editData['levies']) {
        let p = this.common.format(this.editData['levies'])
         this.form.controls.levies.setValue(p)
      }
      if(this.editData['listed_on']) this.form.controls.listed_on.setValue(this.editData['listed_on'])
      if(this.editData['ref_no']) this.form.controls.ref_no.setValue(this.editData['ref_no'])
      if(this.editData['sold_on']) this.form.controls.sold_on.setValue(this.editData['sold_on'])
      if(this.editData['sqm_undercover']) this.form.controls.sqm_undercover.setValue(this.editData['sqm_undercover'])
      if(this.editData['sold'] == 1) this.form.controls.sold.setValue(true)
      if(this.editData['area']) this.selectedAreas = JSON.parse(this.editData['area'])
    }
  }
  
  search(event) {
    if (event.srcElement.value && this.searchKey && this.searchKey.indexOf(',') == -1) {
      this.utilityService.searchAreas(event.srcElement.value, 'za').toPromise().then(res => {
        this.utilityService.areaSearchResults.next(res)
        // delete this.selectedArea
        this.popoverCtrl.getTop().then(r => {
          if (r) {
            this.popoverCtrl.dismiss();
          }
        })
        this.popoverFlag = false;
        // if(this.popoverFlag){
        // }
        setTimeout(() => {
          this.presentPopover(event)
        }, 200);
      })
    }
  }

  async presentPopover(ev) {
    const searchPopover = await this.popoverCtrl.create({
      component: SearchPopoverListComponent,
      event: ev,
      translucent: true,
      keyboardClose: false,
      mode: "ios",
      showBackdrop: true,
      backdropDismiss: true,
    })
    this.popoverFlag = true;
    await searchPopover.present();
    const { data } = await searchPopover.onDidDismiss()
    this.popoverCtrl.getTop().then(r => {
      if (r && data) {
        this.popoverCtrl.dismiss();
      }
    })
    if (data) {
      this.selectedAreas = data;
      this.searchKey = ''
    }
    this.popoverCtrl
    this.popoverFlag = false;
  }

  save() {
    this.common.presentLoader();
    let item = { ...this.form.value }
    if (this.selectedAreas && this.selectedAreas.area_id) {
      item['area_id'] = this.selectedAreas.area_id
      item['area_name'] = this.selectedAreas.area
      item['area'] = JSON.stringify(this.selectedAreas)
    }
    else {
      item['area_id'] = null;
      item['area_name'] = null;
      item['area'] = null;
    }
    if (this.editData) {
      item['id'] = this.editData['id'];
      item['account_id'] = this.editData['account_id']
    }
    if(item['initial_price']) item['initial_price'] = this.common.unFormat(item['initial_price'])
    if(item['lowest_price']) item['lowest_price'] = this.common.unFormat(item['lowest_price'])
    if(item['levies']) item['levies'] = this.common.unFormat(item['levies'])
    this.trackerSrvc.upsertSet(item).toPromise().then(res => {
      if (res) {
        if (res['insert_id']) {
          item.id = res['insert_id']
          this.common.presentToast('New Tracker set has been created.')
        }
        else if (res['affected_rows']) {
          this.common.presentToast('Tracker set changes have been saved.')
        }
        this.dismissModal(true)
      }
      else this.common.presentToast('Server Error. Contact support team')
    }).finally(()=>this.common.dismissLoader())
  }
  dismissModal(refresh?) {
    this.modalCtrL.dismiss(refresh)
  }

}
