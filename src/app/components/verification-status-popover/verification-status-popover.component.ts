import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-verification-status-popover',
  templateUrl: './verification-status-popover.component.html',
  styleUrls: ['./verification-status-popover.component.scss'],
})
export class VerificationStatusPopoverComponent implements OnInit {

  @Input() status;

  constructor(
    private popoverCtrlr:PopoverController
  ) { }

  ngOnInit() {}

  selectStatus(){
    this.popoverCtrlr.dismiss(this.status)
  }

}
