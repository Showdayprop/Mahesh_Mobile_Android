import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'imageurl'
})
export class ImageurlPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    let str = value;
    if (value && value.charAt(0) == '.') {
      str = value.substr(1)
    }
    else if (value.charAt(0) != '/') {
      str = '/' + value
    }
    return environment.config.baseStorageUrl + str;
  }

}
