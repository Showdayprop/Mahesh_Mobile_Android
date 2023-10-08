import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss'],
})
export class ImageSliderComponent implements OnInit {
  @Input('item') item: any;
  @Input('idx') idx: number;
  constructor() { }

  ngOnInit() { }

  async imageSlideChange(event, service, idx) {
    event.srcElement.getActiveIndex().then(indx => {
      service['activeImage'] = indx
    });
  }

}
