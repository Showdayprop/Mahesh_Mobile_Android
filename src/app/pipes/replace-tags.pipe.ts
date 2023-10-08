import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceTags'
})
export class ReplaceTagsPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value ? value.replace(/&lt;br&gt;|&lt;\/p&gt;|&lt;p&gt;|&amp;|nbsp;|&nbsp;/g, '') : value;
  }

}
