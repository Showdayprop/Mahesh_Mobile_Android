import { ModalController } from '@ionic/angular';
import { UtilityService } from './../../providers/utilities.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-estate-search',
  templateUrl: './estate-search.component.html',
  styleUrls: ['./estate-search.component.scss'],
})
export class EstateSearchComponent implements OnInit {
  locationsNearMe;
  locationsFromServer: any;
  searchedList;
  result;

  constructor(private utilitiesSrvc: UtilityService,
    private modalCtrl: ModalController) {
    //loc 1 baldersani -26.034294, 28.066144
    let geoResponse = {
      // coords: {
      lat: "-26.034294",
      long: "28.066144",
      code: "ZA"
      // }
    }
    this.utilitiesSrvc.getCurrentLocationFromServer(geoResponse).toPromise().then((res: any) => {
      this.locationsNearMe = res;
      this.locationsFromServer = res.filter(el => el.estates.length > 0)
    })
  }

  ngOnInit() { }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  searchInput(event) {
    if (event.target.value) {
      this.utilitiesSrvc.searchAreas(event.srcElement.value, 'za', true).toPromise().then(res => {
        this.searchedList = res;
      })
    }
  }
  searchSelected(value, type, item?) {
    if (type == 'nearby') {
      this.result = {
        country: item.country,
        community_address: value.community_address,
        community_id: value.community_id,
        community_name: value.community_name,
        city: item.city.city,
        city_id: item.city.id,
        area: item.locality.area,
        area_id: item.locality.id,
        state: item.state.state,
        state_id: item.state.id,
        type: type
      }
    }
    else {
      this.result = {
        ...value,
        type: type
      }
    }
    /* else if (type == "estate") {
      this.result = {
        country: value.country,
        community_address: value.community_address,
        community_id: value.community_id,
        community_name: value.community_name,
        city: value.city,
        city_id: value.city_id,
        area: value.area,
        area_id: value.area_id,
        state: value.state,
        state_id: value.state_id
      }
    } else if (type == 'area') {
      this.result = {
        country: value.country,
        community_address: null,
        community_id: null,
        community_name: null,
        city: value.city,
        city_id: value.city_id,
        area: value.area,
        area_id: value.area_id,
        state: value.state,
        state_id: value.state_id
      }
    } */
    // else return null
    this.modalCtrl.dismiss(this.result)
  }
}
