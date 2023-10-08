import { Common } from './../../shared/common';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import cloneDeep from 'lodash.clonedeep';

@Component({
  selector: 'app-showdays-capture',
  templateUrl: './showdays-capture.component.html',
  styleUrls: ['./showdays-capture.component.scss'],
})
export class ShowdaysCaptureComponent implements OnInit {

  @Input() existingShowdays:any;
  @Output() showdayUpdated = new EventEmitter<any>();

  maxDate;
  minDate;
  currentDate = new Date().toISOString();
  singleShowday={
    startDate:this.currentDate,
    endDate:'',
  };
  showdays:any=[]
  constructor(private common:Common) { 
    this.maxDate = new Date();
    this.minDate = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth()+3)
    this.minDate.setMonth(this.minDate.getMonth()-3)
    this.maxDate = this.maxDate.toISOString()
    this.minDate = this.minDate.toISOString()
  }

  ngOnInit() {
    if(this.existingShowdays && this.existingShowdays.length>0){
      this.showdays =[]
      this.existingShowdays.forEach(element => {
        let obj = {
          startDate:element.showday_from.replace(/-/g, '/'),
          endDate:element.showday_to.replace(/-/g, '/'),
          id:element.id
        }
        console.log(obj)
        this.showdays.push(obj)
      });
      this.showdayUpdated.emit(this.showdays)
    }
  }
  addShowday(){
    if(this.showdays.length<5){
      let lastShow = this.showdays[this.showdays.length-1]
      if(lastShow){
        if(lastShow.startDate =='' || lastShow.startTime =='' || lastShow.endDate =='' || lastShow.endTime ==''){
          //last showday is not valid
          this.common.presentToast('Complete the last showday to add another.!')
          return;
        }
        else{
          this.showdays.push(cloneDeep(this.singleShowday))
          this.showdayUpdated.emit(this.showdays)
        }
      }else{
        this.showdays.push(cloneDeep(this.singleShowday))
        this.showdayUpdated.emit(this.showdays)
      }
    }
  }

  removeShowday(index, showday_id){
    this.common.presentLoader();
    let modifiedShowdays = cloneDeep(this.showdays);
    this.showdays.splice(index,1)
    if(showday_id){
      modifiedShowdays[index].deleted =  true;
    }
    console.log(modifiedShowdays)
    this.showdayUpdated.emit(modifiedShowdays)
    this.common.dismissLoader();
  }
  
  fireChange(index, dateType){
    console.log(this.showdays)
    if(dateType == 'Start'){
      let start = new Date(this.showdays[index].startDate)
      start.setHours(start.getHours()+1)
      this.showdays[index].endDate = start.toISOString()
      this.showdayUpdated.emit(this.showdays)
    }else{
      this.showdayUpdated.emit(this.showdays)
    }
  }
}
