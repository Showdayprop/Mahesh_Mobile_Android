import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe extends DatePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if(value){
      let v = value.replace(/ /g,"T")
      if(args[0]){
        return super.transform(v, args[0]);
      }else{
        return super.transform(v, "EEE, dd MMM y, HH:mm");
      }
    }
    return null
  }

}
