import { Common } from './../../../shared/common';
import { PropertiesService } from './../../../providers/properties.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilityService } from './../../../providers/utilities.service';
import { Component, OnInit} from '@angular/core';
import { NavController } from '@ionic/angular';
import { priceOptions } from '../../../shared/static_values';
import cloneDeep from 'lodash.clonedeep';

@Component({
  selector: 'app-add-url',
  templateUrl: './add-url.page.html',
  styleUrls: ['./add-url.page.scss'],
})
export class AddUrlPage implements OnInit {
  
  externalURL:FormGroup

  roomsConfig = [{
    id: 1,
    label:  'One'
  }, {
    id: 2,
    label:  'Two'
  }, {
    id: 3,
    label:  'Three'
  }, {
    id: 4,
    label:  'Four'
  }, {
    id: 5,
    label:  'Five +'
  }];
  houseTypes;
  requirements;
  x=.33;
  validation_messages;

  showdays:any=[]

  priceOpts = priceOptions;
  maxPriceSliceStartIndex=0;
  minPriceSliceEndIndex=this.priceOpts.length;
  DECIMAL_SEPARATOR=".";
  GROUP_SEPARATOR=",";
  property;

  constructor(
    public formBuilder: FormBuilder,
    private utilitySrvc:UtilityService,
    private navCtrl:NavController,
    private activatedRoute:ActivatedRoute,
    private router:Router,
    private propertiesSrvc:PropertiesService,
    private common:Common) {
    this.property = this.propertiesSrvc.newProperty.getValue();
    if(this.utilitySrvc.houseTypes && this.utilitySrvc.houseTypes.length>0){
      this.houseTypes = this.utilitySrvc.houseTypes
    }
    else{
      this.utilitySrvc.getHouseTypes().then(res=>{
        this.houseTypes = res
      })
    }
    if(this.utilitySrvc.requirements && this.utilitySrvc.requirements.length>0){
      this.requirements = this.utilitySrvc.requirements
    }
    else{
      this.utilitySrvc.getRequirements().then(res=>{
        this.requirements = res
      })
    }
  }

  ngOnInit() {
    // setTimeout(() => {
    //   this.x = .7;
    // }, 2000);

    this.externalURL = this.formBuilder.group({
      url: ['', Validators.compose([
        Validators.required])],
      requirement: ['', Validators.compose([
        Validators.required])],
      house_type: ['', Validators.compose([
        Validators.required])],
      minimum_price: ['', Validators.compose([
        Validators.required,
        Validators.pattern('[0-9,]+$')])],
      maximum_price: ['', Validators.compose([
        Validators.pattern('[0-9,]+$')])],
      bedrooms: ['', Validators.compose([
        Validators.required])],
      bathrooms: ['', Validators.compose([
        Validators.required])],
    });

    if(this.property && this.property.id){
      this.externalURL.controls.url.setValue(this.property.external_url);
      this.externalURL.controls.house_type.setValue(this.property.property_type);
      this.externalURL.controls.requirement.setValue(this.property.available_for);
      this.externalURL.controls.minimum_price.setValue(this.property.bottom_price_value?this.property.bottom_price_value.replace(/,/g, ''):'');
      this.externalURL.controls.maximum_price.setValue(this.property.upper_price_value?this.property.upper_price_value.replace(/,/g, ''):'');
      this.externalURL.controls.bedrooms.setValue(this.property.num_bedroom);
      this.externalURL.controls.bathrooms.setValue(this.property.num_bathroom);
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
      ]
    };
  }

  ionViewWillEnter(){
    this.property = this.propertiesSrvc.newProperty.getValue();
  }
  
  proceed(){
    this.common.presentLoader()
    this.externalURL.value.minimum_price = this.externalURL.value.minimum_price.replace(/,/g, '');
    this.externalURL.value.maximum_price = this.externalURL.value.maximum_price.replace(/,/g, ''); 
    let data = {
      'showdays':this.formatShowdays(),
      "visibility":this.property && this.property.visibility ? this.property.visibility : 'Hide',
      ...this.externalURL.value,
      "id":this.property && this.property.id ? this.property.id : null
    }
    this.propertiesSrvc.createPropertyWithURL(data).toPromise().then((res:any)=>{
      if(res && res.status.toLowerCase()=='success' && res.id){
        //successful property creation
        data['id']=res.id;
        data = {...this.property,...data};
        this.property = cloneDeep(data);
        this.propertiesSrvc.newProperty.next(data);
        this.navCtrl.navigateForward(['./upload-image'],{relativeTo:this.activatedRoute})
      }
      else{
        this.common.presentToast('error_response')
      }
    }).catch(err=>{
      this.common.presentToast('Unable connect to server. Please try again later or contact support.!')
    }).finally(()=>{
      this.common.dismissLoader();
    })
  }

  capturedShowdays(event){
    this.showdays = event;
  }
  formatShowdays(){
    let shows=[];
    this.showdays.forEach(element => {
      console.log(element)
      console.log( element.startDate.split('T')[0] + " " + element.startDate.split('T')[1].slice(0,8))
      if(element.startDate !='' && element.endDate !=''){
        shows.push({
          'showday_start_date': element.startDate.split('T')[0] + " " + element.startDate.split('T')[1].slice(0,8),
          'showday_end_date': element.endDate.split('T')[0] + " " + element.endDate.split('T')[1].slice(0,8),
          'id':element.id ? element.id : undefined
        })
      }
      console.log(shows)
    });
    return shows;
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
      val = val.replace(/^0+/, '').replace(/\D/g,'');
      if (this.GROUP_SEPARATOR === ',') {
          return val.replace(/,/g, '');
      } else {
          return val.replace(/\./g, '');
      }
  };
  exit(){
    this.common.presentAlertForConfirmation('exit_new_property','Confirm').then(()=>{
      this.propertiesSrvc.newProperty.next(null)
      this.propertiesSrvc.editedProperty.next(true);
      this.propertiesSrvc.needListingRefresh = false;
      this.navCtrl.navigateRoot('/seller')
    })
  }
}
