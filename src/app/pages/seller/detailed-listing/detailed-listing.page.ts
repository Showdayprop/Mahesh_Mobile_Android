import { EventsService } from './../../../providers/events.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilityService } from '../../../providers/utilities.service';
import { PropertiesService } from '../../../providers/properties.service';
import { Common } from '../../../shared/common';
import cloneDeep from 'lodash.clonedeep';

@Component({
  selector: 'app-detailed-listing',
  templateUrl: './detailed-listing.page.html',
  styleUrls: ['./detailed-listing.page.scss'],
})
export class DetailedListingPage implements OnInit {
  marketingForm: FormGroup;
  validation_messages;
  houseTypes;
  requirements;
  DECIMAL_SEPARATOR = ".";
  GROUP_SEPARATOR = ",";
  features = [];
  showdays = [];
  property;
  maxDate;
  currentDate = new Date().toISOString().slice(0, 10);
  @ViewChild('content', {static:false}) content:any;

  constructor(private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    public utilitySrvc: UtilityService,
    private propertiesSrvc: PropertiesService,
    private common: Common,
    private modalCtrl: ModalController,
    private eventsSrvc: EventsService) {
    this.property = this.propertiesSrvc.newProperty.getValue();
    if (this.utilitySrvc.houseTypes && this.utilitySrvc.houseTypes.length > 0) {
      this.houseTypes = this.utilitySrvc.houseTypes
    }
    else {
      this.utilitySrvc.getHouseTypes().then(res => {
        this.houseTypes = res
      })
    }
    if (this.utilitySrvc.requirements && this.utilitySrvc.requirements.length > 0) {
      this.requirements = this.utilitySrvc.requirements
    }
    else {
      this.utilitySrvc.getRequirements().then(res => {
        this.requirements = res
      })
    }

    this.maxDate = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth() + 3)
    this.maxDate = this.maxDate.toISOString().slice(0, 10)
  }

  ngOnInit() {
    this.marketingForm = this.formBuilder.group({
      title: ['', Validators.compose([
        Validators.required])],
      type: ['', Validators.compose([
        Validators.required])],
      requirement: ['', Validators.compose([
        Validators.required])],
      minimum_price: ['', Validators.compose([
        Validators.required,
        Validators.pattern('[0-9,]+$')])],
      maximum_price: ['', Validators.compose([
        Validators.pattern('[0-9,]+$')])],
      virtualTour: [''],
      description: ['', Validators.compose([
        Validators.required])],
      features: [''],
      mandate_type: ['', Validators.compose([
        Validators.required])],
      mandate_start_date: [this.currentDate, Validators.compose([
        Validators.required])],
      mandate_duration: [1, Validators.compose([
        Validators.required, Validators.max(90), Validators.min(1)])]
    })
    if (this.property && this.property.id) {
      this.marketingForm.controls.title.setValue(this.property.property_name);
      this.marketingForm.controls.type.setValue(this.property.property_type);
      this.marketingForm.controls.requirement.setValue(this.property.available_for);
      this.marketingForm.controls.minimum_price.setValue(this.property.bottom_price_value ? this.property.bottom_price_value.replace(/,/g, '') : '');
      this.marketingForm.controls.maximum_price.setValue(this.property.upper_price_value ? this.property.upper_price_value.replace(/,/g, '') : '');
      this.marketingForm.controls.virtualTour.setValue(this.property.input3d_tour);
      this.marketingForm.controls.description.setValue(this.property.property_desc.replace(/&lt;br&gt;|&lt;\/p&gt;|&lt;p&gt;/g, ''));
      if (this.property.features && this.property.features.length > 0) {
        this.features = this.property.features.map(el => el.feature_name);
      }
      this.marketingForm.controls.mandate_type.setValue(this.property.mandate_type);
      this.marketingForm.controls.mandate_start_date.setValue(this.property.mandate_start_date);
      this.marketingForm.controls.mandate_duration.setValue(this.property.mandate_duration);
    }

    this.validation_messages = {
      'url': [
        { type: 'required', message: 'Valid URL is required' }
      ],
      'maximum_price': [
        { type: 'pattern', message: 'Maximum Price can only contain numbers' }
      ],
      'minimum_price': [
        { type: 'required', message: 'Minimum Price is required' },
        { type: 'pattern', message: 'Minimum Price can only contain numbers' }
      ],
      'mandate_type': [
        { type: 'required', message: 'Mandate Type is required' }
      ],
      'mandate_start_date': [
        { type: 'required', message: 'Mandate Start Date is required' },
        { type: 'pattern', message: 'Minimum Price can only contain numbers' }
      ],
      'mandate_duration': [
        { type: 'required', message: 'Mandate duration is required' },
        { type: 'max', message: 'Mandate duration cannot be greater than 90 days' },
        { type: 'min', message: 'Mandate duration cannot be less than 1 day' }
      ]
    };
    // this.navCtrl.navigateForward(['./marketing-info'],{relativeTo:this.activateRoute})
  }
  ionViewWillEnter() {
    this.property = this.propertiesSrvc.newProperty.getValue();
  }
  format(ev) {
    let valString = ev.target.value
    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    return parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR)
  };

  unFormat(val) {
    if (!val) {
      return '';
    }
    val = val.replace(/^0+/, '').replace(/\D/g, '');
    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };

  addFeature(value) {
    if (this.features.filter(el => el == value).length == 0 && value != '') {
      this.features.push(value);
      this.marketingForm.controls['features'].setValue('');
    }
    else {
      this.common.presentToast('You have already added that feature')
    }
    if (this.features.length == 10) {
      this.common.presentToast('Maximum 10 fetures can be added.')
    }
  }

  removeFeature(index) {
    this.features.splice(index, 1)
  }
  capturedShowdays(event) {
    this.showdays = event;
    setTimeout(() => {
      this.content.scrollToBottom(300);//300ms animation speed
    });
  }
  formatShowdays() {
    let shows = [];
    this.showdays.forEach(element => {
      if (element.startDate != '' && element.endDate != '') {
        let start_date;
        if(element.startDate.indexOf('T')>-1){
          start_date = element.startDate.split('T')[0] + " " + element.startDate.split('T')[1].slice(0,8)
        }else{
          start_date = element.startDate;
        }
        let end_date;
        if(element.startDate.indexOf('T')>-1){
          end_date = element.endDate.split('T')[0] + " " + element.endDate.split('T')[1].slice(0,8)
        }else{
          end_date = element.endDate;
        }

        shows.push({
          'showday_start_date': start_date,
          'showday_end_date': end_date,
          'id': element.id ? element.id : undefined,
          'deleted': element.deleted,
        })
      }
    });
    return shows;
  }
  saveContinue() {
    this.common.presentLoader();
    this.marketingForm.value.minimum_price = this.marketingForm.value.minimum_price.replace(/,/g, '');
    this.marketingForm.value.maximum_price = this.marketingForm.value.maximum_price.replace(/,/g, '');
    let mandate_end = new Date(this.marketingForm.controls.mandate_start_date.value);
    mandate_end.setDate(mandate_end.getDate() + this.marketingForm.controls.mandate_duration.value);
    let data = {
      ...this.marketingForm.value,
      "mandate_end_date": this.common.formatDate(mandate_end),
      "features": this.features,
      'showdays': this.formatShowdays(),
      "visibility": this.property && this.property.visibility ? this.property.visibility : 'Hide',
      "id": this.property && this.property.id ? this.property.id : null
    }
    this.propertiesSrvc.createDetailedListing(data).toPromise().then((res: any) => {
      if (res && res.status.toLowerCase() == "success" && res.id) {
        data['id'] = res.id;
        data = { ...this.property, ...data };
        this.property = cloneDeep(data);
        this.propertiesSrvc.newProperty.next(data)
        // this.navCtrl.navigateForward(['./showday-events'], { relativeTo: this.activatedRoute, queryParams: { role: 'agent' } })
        this.navCtrl.navigateForward(['./property-info'], { relativeTo: this.activatedRoute })
      }
      else {
        this.common.presentToast('error_response')
      }
    }).catch(err => {
      this.common.presentToast('server_request_error')
    }).finally(() => {
      this.common.dismissLoader();
    })
  }
  exit() {
    this.common.presentAlertForConfirmation('exit_new_property', 'Confirm').then(() => {
      this.propertiesSrvc.newProperty.next(null)
      this.propertiesSrvc.editedProperty.next(true);
      this.propertiesSrvc.needListingRefresh = false;
      this.navCtrl.navigateRoot('/seller')
    })
  }

  // async addShowdayEvent() {
  //   const modal = await this.modalCtrl.create({
  //     component: CalendarEventsComponent
  //   });
  //   return await modal.present();
  // }
}
