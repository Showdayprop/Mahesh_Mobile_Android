import { LoggerService } from './../../core/logger.service';
import { PropertiesService } from './../../providers/properties.service';
import { EventsService } from './../../providers/events.service';
import { StorageService } from './../../providers/storage.service';
import cloneDeep from 'lodash.clonedeep';
import { ModalController, NavParams } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
// import { MbscRangeOptions, MbscDatetimeOptions, MbscCalendarOptions, MbscColorOptions } from '@mobiscroll/angular';

@Component({
  selector: 'app-configure-event',
  templateUrl: './configure-event.component.html',
  styleUrls: ['./configure-event.component.scss'],
})
export class ConfigureEventComponent implements OnInit {
  event: any = {};
  existingEventData;
  existingEventIndex;
  propertyEvents: any = [];
  control: Array<string>;
  wheels: string;
  property;
  // rangeSettings: MbscRangeOptions = {
  //   controls: ['time'],
  //   startInput: '#startTime',
  //   endInput: '#endTime',
  //   showSelector: false
  // };
  // now = new Date();
  // startDateOptions: MbscCalendarOptions = {
  //   display: 'bottom',
  //   themeVariant: 'dark',
  //   animate: 'slideup',
  //   headerText: '{value}',
  //   circular: true,
  //   yearChange: false,
  //   max: new Date(new Date().setMonth(this.now.getMonth() + 3)),
  //   min: new Date()
  // };
  // colorSettings: MbscColorOptions = {
  //   display: 'inline',
  //   clear: false,
  //   data: ['#fff568', '#ffc400', '#ff5252', '#f48fb1', '#ba68c8', '#8c9eff', '#90caf9', '#9ccc65', '#0db057', '#bcaaa4']
  // };
  constructor(private modalCtrl: ModalController,
    private eventsSrvc: EventsService,
    private navParams: NavParams,
    private propertiesSrvc: PropertiesService,
    private logger: LoggerService) {
    this.propertyEvents = cloneDeep(this.eventsSrvc.propertyEvents.getValue());
    this.property = this.propertiesSrvc.newProperty.getValue();
    if (!this.propertyEvents) {
      this.propertyEvents = [];
    }
    if (this.navParams.get('type') && this.navParams.get('type') == 'edit') {
      let eventId = this.navParams.get('id');
      this.existingEventData = this.propertyEvents.find(el => el.id == eventId);
      this.existingEventIndex = this.propertyEvents.findIndex(el => el.id == eventId);
      if (this.existingEventIndex > -1 && this.existingEventData.date && this.existingEventData.start && this.existingEventData.end && this.existingEventData.text) {
        this.event.date = new Date(this.existingEventData.date);
        this.event.eventTime = [new Date(this.existingEventData.start), new Date(this.existingEventData.end)];
        this.event.text = this.existingEventData.text.split('<')[0];
        this.event.expiry = Number(this.existingEventData.expiry);
        this.event = { ...this.existingEventData, ...this.event }
      }
      else {
        this.logger.error('ConfigureEventComponent : constructor : edit event failed :', this.existingEventIndex, ":", this.existingEventData)
      }
    }
  }

  ngOnInit() { }

  change() {
    this.control = this.event.repeat ? ['date'] : ['date', 'time'];
    this.wheels = this.event.repeat ? 'MM dd yy' : '|D M d|';
  }
  saveEvent() {
    let events = [];
    events.push(cloneDeep(this.event));
    if (this.event.repeat) {
      //user has opted for repeating the event
      //remove the repeat flag as it is no more required and messes up the logic later
      delete this.event.repeat;
      for (let index = 1; index < 4; index++) {
        let obj = cloneDeep(this.event)
        obj.date.setDate(obj.date.getDate() + index * 7);
        events.push(cloneDeep(obj))
      }
    }
    events.forEach((el, indx) => {
      el.eventTime[0].setDate(el.date.getDate());
      el.eventTime[0].setMonth(el.date.getMonth());
      el.eventTime[0].setFullYear(el.date.getFullYear());
      el.eventTime[1].setDate(el.date.getDate());
      el.eventTime[1].setMonth(el.date.getMonth());
      el.eventTime[1].setFullYear(el.date.getFullYear());
      el.start = el.eventTime[0].toLocaleString();
      el.end = el.eventTime[1].toLocaleString();
      delete el.eventTime;
      el.date = el.date.toLocaleDateString();
      // el.id = this.propertyEvents.length + indx
    });
    console.log([...events, ...this.propertyEvents])
    console.log(events)
    if (this.property && this.property.id) {
      this.eventsSrvc.addEvent({ events: events, property_id: this.property.id }).toPromise().then((res: any) => {
        if (res && res.length > 0) {
          let type;
          if (this.existingEventData && this.existingEventIndex) {
            this.propertyEvents[this.existingEventIndex] = events[0];
            this.eventsSrvc.updateEvents(this.propertyEvents)
            type = 'edit';
          }
          else {
            this.eventsSrvc.updateEvents([...res, ...this.propertyEvents])
            type = 'add';
          }
          this.modalCtrl.dismiss(res, type)
        }
        else {
          this.logger.error('ConfigureEventComponent : saveEvent : server response check failed :', res)
        }
      })
    }
    else {
      this.logger.error('ConfigureEventComponent : saveEvent : if elseif condition failed :', this.existingEventIndex, ":", this.existingEventData)
    }
  }

  delete(id) {
    if (this.property && this.property.id) {
      this.eventsSrvc.deleteEvent({ id: id, prop_id: this.property.id }).toPromise().then(res => {
        if (res && res == 1) {
          //event deleted successfully
          this.propertyEvents.splice(this.existingEventIndex, 1)
          this.eventsSrvc.updateEvents(this.propertyEvents)
          this.modalCtrl.dismiss(Number(id), 'delete');
        }
        else {
          this.logger.error('ConfigureEventComponent : delete : server failed to delete event :', id, ':', res)
        }
      })
    }
  }
  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
