import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-photos-permission',
  templateUrl: './photos-permission.component.html',
  styleUrls: ['./photos-permission.component.scss'],
})
export class PhotosPermissionComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }
  dismiss() {
    this.modalCtrl.dismiss()
  }
}
