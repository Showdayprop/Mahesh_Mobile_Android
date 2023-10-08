import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';
import {CallNumber} from '@ionic-native/call-number/ngx';

export interface DialogData {
    seller_name: string;
    seller_contact_number: string;
}

@Component({
    selector: 'app-seller-detail',
    templateUrl: './agent-contact-detail.component.html',
    styleUrls: ['./agent-contact-detail.component.scss'],
    providers: [
        {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}}
    ]
  })
export class AgentContactDetailComponent {

    constructor(
        public dialogRef: MatDialogRef<AgentContactDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        public call: CallNumber
    ) {}

    dialNumber(contactNumber) {
        this.call.callNumber(contactNumber, true);
    }

    cancelDialog(): void {
        this.dialogRef.close();
    }
}