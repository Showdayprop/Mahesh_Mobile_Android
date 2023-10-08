import { ModalController, NavParams } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
})
export class ImageGalleryComponent implements OnInit {
  images;
  currentIndex;

  slideOpts = {
    initialSlide: 0,
    speed: 200,
    slidesPerView:1,
    centeredSlides:true,
    centeredSlidesBounds:true,
    loop:true,
    zoom:{
      maxRatio:2
    }
  };
  constructor(private modalCtrl:ModalController,
      private navParams:NavParams) { 
      this.images = navParams.get('images');
      this.currentIndex = navParams.get('currentIndex');
      this.slideOpts.initialSlide = this.currentIndex;
      this.slideOpts['pagination']={
        el: '.swiper-pagination',
        type: 'fraction',
      };
  }

  ngOnInit() {}
  dismissModal(){
    this.modalCtrl.dismiss();
  }
}
