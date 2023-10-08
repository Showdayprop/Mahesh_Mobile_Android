import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const regex: RegExp = new RegExp(/(\d{3})(\d{3})(\d{4})/);
    const match = value.match(regex);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    } else {
      return value;
    }
  }

}
