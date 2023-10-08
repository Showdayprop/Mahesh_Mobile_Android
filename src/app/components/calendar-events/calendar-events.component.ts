import { BookingService } from './../../providers/booking.service';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
// import { mobiscroll, MbscEventcalendarOptions, MbscRangeOptions, MbscFormOptions, MbscEventcalendar, MbscPopupOptions } from '@mobiscroll/angular';
import cloneDeep from 'lodash.clonedeep';
import { EventsService } from '../../providers/events.service';
import { PropertiesService } from '../../providers/properties.service';
import { Common } from '../../shared/common';
import { LoggerService } from '../../core/logger.service';
import { ConfigureEventComponent } from '../configure-event/configure-event.component';

const btn = '<button class="mbsc-btn mbsc-btn-outline mbsc-btn-danger md-delete-btn mbsc-ios">Delete</button>';
@Component({
    selector: 'app-calendar-events',
    templateUrl: './calendar-events.component.html',
    styleUrls: ['./calendar-events.component.scss'],
})
export class CalendarEventsComponent implements OnInit {
    markedDays: any = [];
    color = "#c40000"
    fetchedEvents: any = [];
    now = new Date();
    events: any = [];
    btnEdit = '<button class="mbsc-btn mbsc-btn-outline mbsc-btn-primary md-edit-btn">Edit</button>';
    property: any = [];
    pageRole;
    defaultExpiry = 2;
    constructor(private navCtrl: NavController,
        private modalCtrl: ModalController,
        private eventsSrvc: EventsService,
        private propertiesSrvc: PropertiesService,
        private common: Common,
        private logger: LoggerService,
        private activatedRoute: ActivatedRoute,
        private bookingSrvc: BookingService) {
        this.pageRole = this.activatedRoute.snapshot.queryParams.role;
        if (this.pageRole == 'agent') {
            this.property = this.propertiesSrvc.newProperty.getValue();
        }
        else if (this.pageRole == 'buyer') {
            this.property = this.propertiesSrvc.propertyDetail.getValue();
        }
        // this.property.id = '2403';
        // this.propertiesSrvc.newProperty.next(this.property)
        if (this.property.id) {
            this.eventsSrvc.fetchPropertEvents({ id: this.property.id }).toPromise().then((data: any) => {
                if (data && data.length > 0) {
                    let events = data.map(el => {
                        return {
                            color: el.color ? el.color : '#fff568',
                            date: el.date ? el.date : this.common.converSqlDateToJavascript(el.start),
                            description: el.description,
                            end: this.common.converSqlDateToJavascript(el.end),
                            expiry: el.expiry ? Number(el.expiry) : null,
                            id: el.id,
                            start: this.common.converSqlDateToJavascript(el.start),
                            text: el.text ? el.text : 'Showday'
                        }
                    })
                    this.eventsSrvc.propertyEvents.next(events);
                    this.formatAndAddEvents(cloneDeep(events));
                }
                else {
                    this.eventsSrvc.propertyEvents.next(null)
                }
            })
        }
        else {
            this.eventsSrvc.propertyEvents.next(null)
        }
        // let events = this.eventsSrvc.propertyEvents.getValue();
        // if (events && events.length > 0) {
        //     this.formatAndAddEvents(cloneDeep(events));
        // }
    }

    // events: any;

    /*eventSettings: MbscEventcalendarOptions = {
        theme: 'ios',
        themeVariant: 'dark',
        display: 'inline',
        view: {
            calendar: { type: 'week', size: 3 },
            eventList: { type: 'week', size: 3, scrollable: true }
        },
        onEventSelect: (event, inst) => {
            if (this.pageRole == 'agent') {
                this.add(event.event);
            }
            else if (this.pageRole == 'buyer') {
                //check for minimum booking time
                let hoursDiff = this.common.diff_hours(event.event.start, new Date());
                if (hoursDiff < (event.event.expiry ? event.event.expiry : this.defaultExpiry)) {
                    this.common.presentPopupAlertForOK('The Showday event is closed for booking. Please select another one or contact the Agent');
                    return;
                }
                this.common.presentAlertForConfirmation('Do you want to proceed with booking this Showday.?', 'Confirm', 'Yes', 'No').then(d => {
                    this.bookingSrvc.bookingEventData.next(event.event)
                    this.navCtrl.navigateForward(['./booking-form'], { relativeTo: this.activatedRoute })
                }).catch(decline => {
                    this.logger.log('CalendarEventsComponent:onEventSelect: buyer cancelled')
                })
            }
        }
    }; */
    @ViewChild('mbscMonthCal', { static: false })
    // monthCal: MbscEventcalendar;

    @ViewChild('mbscDayCal', { static: false })
    // dayCal: MbscEventcalendar;
    //   events: any = [{
    //       id: 1,
    //       d:new Date(now.getFullYear(), now.getMonth(), 8, 13),
    //       start: new Date(now.getFullYear(), now.getMonth(), 8, 13),
    //       end: new Date(now.getFullYear(), now.getMonth(), 8, 13, 30),
    //       text: 'Lunch @ Butcher\'s' + btn,
    //       color: this.color
    //   }, {
    //       id: 2,
    //       d: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15),
    //       start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15),
    //       end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16),
    //       text: 'General orientation' + btn,
    //       color: this.color
    //   }, {
    //       id: 3,
    //       d: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18),
    //       start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18),
    //       end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 22),
    //       text: 'Dexter BD' + btn,
    //       color: this.color
    //   }, {
    //       id: 4,
    //       d: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30),
    //       start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30),
    //       end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 30),
    //       text: 'Stakeholder mtg.' + btn,
    //       color: this.color
    //   }];


    navigate(inst, val) {
        if (inst) {
            inst.navigate(val);
        }
    }

    ngOnInit() {
    }

    async add(event?) {
        let props = {};
        if (event && event.id) {
            props = {
                type: 'edit',
                id: event.id
            }
        }
        else {
            this.logger.error('CalendarEventsComponent : add : event && event.id check failed')
        }
        const modal = await this.modalCtrl.create({
            component: ConfigureEventComponent,
            componentProps: props
        });
        modal.onDidDismiss().then((data) => {
            if (data && data.data && data.role) {
                switch (data.role) {
                    case 'add':
                        if (data.data instanceof Array) {
                            this.formatAndAddEvents(cloneDeep(data.data))
                        }
                        break;

                    case 'delete':
                        if (typeof data.data === 'number') {
                            let index = this.fetchedEvents.findIndex(el => el.id == data.data)
                            this.fetchedEvents.splice(index, 1)
                            index = this.markedDays.findIndex(el => el.id == data.data)
                            this.markedDays.splice(index, 1)
                        }
                        break;

                    case 'edit':
                        if (data.data instanceof Array) {
                            let obj = data.data[0];
                            let index = this.fetchedEvents.findIndex(el => el.id == obj.id)
                            obj.description = obj.description ? obj.description : '';
                            obj.text = obj.text ? obj.text + '<div class="mbsc-bold md-event-desc">' + obj.description + '</div>' : "Event";
                            obj.start = new Date(obj.start);
                            obj.end = new Date(obj.end);
                            this.fetchedEvents[index] = cloneDeep(obj)
                            index = this.markedDays.findIndex(el => el.id == obj.id)
                            // this.markedDays[index].d = obj.date;
                            this.markedDays[index].start = obj.start;
                            this.markedDays[index].end = obj.end;
                            this.markedDays[index].background = obj.color;
                        }
                        break;

                    default:
                        break;
                }
            }
        })
        return await modal.present();
    }

    formatAndAddEvents(arr) {
        arr.forEach(el => {
            el.description = el.description ? el.description : '';
            let expiryText = '';
            el.expiry = el.expiry ? el.expiry : this.defaultExpiry;
            if (this.pageRole == 'buyer') {
                let hr = Number(el.expiry) > 1 ? 'Hrs' : 'Hr';
                expiryText = '<div class="mbsc-txt-muted mbsc-italic">Book ' + el.expiry + '&nbsp' + hr + ' in advance</div>'
            }
            el.text = el.text ? el.text + '<div class="mbsc-bold md-event-desc">' + el.description + '</div>' + expiryText : 'Event';
            el.start = new Date(el.start);
            el.end = new Date(el.end);
            el.id = el.id ? el.id : null
            this.markedDays.push({
                // d: el.date ? el.date : el.start,
                start: el.start,
                end: el.end,
                background: el.color ? el.color : "#c40000",
                id: el.id
            });
            this.fetchedEvents.push(el);
        });
    }
    saveContinue() {
        this.navCtrl.navigateForward(['../property-info'], { relativeTo: this.activatedRoute })
        // this.propertiesSrvc.updatePropertySpecs(data).toPromise().then((res:any)=>{
        //   if(res && res.toLowerCase() == "success"){
        //     data = {...this.property,...data};
        //     this.property = cloneDeep(data);
        //     this.propertiesSrvc.newProperty.next(data);
        //     this.navCtrl.navigateForward(['../upload-coordinates'],{relativeTo:this.activatedRoute,
        //       queryParams:{
        //         page:'detailed'
        //       }})
        //   }
        //   else{
        //     this.common.presentToast('error_response')
        //   }
        // }).catch(err=>{
        //   this.common.presentToast('server_request_error')
        // }).finally(()=>{
        //   this.common.dismissLoader();
        // })
    }
    exit() {
        this.common.presentAlertForConfirmation('exit_new_property', 'Confirm').then(() => {
            this.propertiesSrvc.newProperty.next(null)
            this.propertiesSrvc.needListingRefresh = true;
            this.navCtrl.navigateRoot('/seller')
        })
    }
}
