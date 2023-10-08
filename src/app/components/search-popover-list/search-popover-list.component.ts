import { UtilityService } from './../../providers/utilities.service';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-search-popover-list',
  templateUrl: './search-popover-list.component.html',
  styleUrls: ['./search-popover-list.component.scss'],
})
export class SearchPopoverListComponent implements OnInit {
  list;
  constructor(private utilitySrvc:UtilityService,
    private popoverCtrlr:PopoverController) { 
    this.utilitySrvc.areaSearchResults.subscribe(data=>{
      this.list = data
    })
  }

  ngOnInit() {
  }
  valueSelected(ev,item){
    this.popoverCtrlr.dismiss(item)
  }

}
