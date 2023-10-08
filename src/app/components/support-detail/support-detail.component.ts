import {Component} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';
import {CallNumber} from '@ionic-native/call-number/ngx';

@Component({
    selector: 'app-support-detail',
    templateUrl: './support-detail.component.html',
    styleUrls: ['./support-detail.component.scss'],
    providers: [
        {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}}
    ]
  })
export class SupportDetailComponent {

    constructor(
        public dialogRef: MatDialogRef<SupportDetailComponent>,
        public call: CallNumber
    ) {}

    dialNumber() {
        this.call.callNumber('+27 10 003 10 10', true);
    }

    cancelDialog(): void {
        this.dialogRef.close();
    }
}