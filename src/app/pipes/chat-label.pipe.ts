import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatLabel'
})
export class ChatLabelPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    let label = 'Chat Room';
    // return 'Chat Room';
    if (Array.isArray(value) && value.length > 0) {
      // the value is an array of users
      label = '';
      value.forEach(({ userId }, idx, array) => {
        if (userId.account_id == args[0]) {
          if (idx == array.length - 1) {
            label = label.slice(0, -2);
          }
          return;
        }
        label += userId.first_name;
        if (userId.surname) {
          label += ' ' + userId.surname;
        }
        if (idx != array.length - 1) {
          label += ', ';
        }
      })
    }
    return label
  }
}
