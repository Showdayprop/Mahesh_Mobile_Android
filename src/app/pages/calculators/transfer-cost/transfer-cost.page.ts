import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Plugins, Share } from '@capacitor/core';
import { LoggerService } from '../../../core/logger.service';
import { BookingService } from '../../../providers/booking.service';
import { PropertiesService } from '../../../providers/properties.service';
import { UtilityService } from '../../../providers/utilities.service';
import { Common } from '../../../shared/common';

@Component({
  selector: 'app-transfer-cost',
  templateUrl: './transfer-cost.page.html',
  styleUrls: ['./transfer-cost.page.scss'],
})
export class TransferCostPage implements OnInit {

  purchase_price = "0";
  bond_amount = "0";
  transfer_duty = 0;
  conveyancing_fees = 5200;
  transfer_cost = 0;
  bond_cost = 0;

  transferCostObject = {
    pp: this.purchase_price,
    bm: this.bond_amount,
  }

  constructor(
    private route: ActivatedRoute,
    private decimalPipe: DecimalPipe,
    private common: Common,
    private utilitySrvc: UtilityService,
    private logger: LoggerService
  ) {
    this.route.queryParams.subscribe(params => {
      let data = params['data'];
      if (data) {
        let homeLoanParsedObject = JSON.parse(atob(data));
        this.purchase_price = homeLoanParsedObject.pp;
        this.bond_amount = homeLoanParsedObject.bm;
        this.calculate();
      }
    });
  }

  ngOnInit() {

  }


  calculate(event?, key?) {
    if (event && key && this[key]) {
      this[key] = this.decimalPipe.transform(Number(event.replace(/,/g, '')))
    }
    this.transferCostObject = {
      pp: this.purchase_price,
      bm: this.bond_amount,
    }

    let disbursetran = 1955;
    let transfervat = 0;

    let disbursebond = 0;
    let bondvat = 0;
    let array = [];
    array[0] = Number(this.purchase_price.replace(/,/g, ''));
    array[1] = Number(this.bond_amount.replace(/,/g, ''));

    let conveyarray = [];
    let deedsarray = [];

    for (let i = 0; i < array.length; i++) {

      if (array[i] <= 100000) {
        conveyarray[i] = 5200;
      }

      if (array[i] > 100000 && array[i] <= 500000) {
        conveyarray[i] = 5200 + (Math.floor((array[i] - 100000) / 50000) + 1) * 800;
      }

      if (array[i] > 500000 && array[i] <= 1000000) {
        conveyarray[i] = 11600 + (Math.floor((array[i] - 500000) / 100000) + 1) * 1600;
      }

      if (array[i] > 1000000 && array[i] <= 5000000) {
        conveyarray[i] = 19600 + (Math.floor((array[i] - 1000000) / 200000) + 1) * 1600;
      }

      if (array[i] > 5000000) {
        conveyarray[i] = 51600 + (Math.floor((array[i] - 5000000) / 500000) + 1) * 2000;
      }


      transfervat = (conveyarray[0] + disbursetran) * 0.15;

      if (array[i] <= 100000) {
        deedsarray[i] = 39;
      }
      if (array[i] > 100000 && array[i] <= 200000) {
        deedsarray[i] = 86;
      }

      if (array[i] > 200000 && array[i] <= 300000) {
        deedsarray[i] = 539;
      }


      if (array[i] > 300000 && array[i] <= 600000) {
        deedsarray[i] = 673;
      }

      if (array[i] > 600000 && array[i] <= 800000) {
        deedsarray[i] = 946;
      }
      if (array[i] > 800000 && array[i] <= 1000000) {
        deedsarray[i] = 1086;
      }


      if (array[i] > 1000000 && array[i] <= 2000000) {
        deedsarray[i] = 1220;
      }

      if (array[i] > 2000000 && array[i] <= 4000000) {
        deedsarray[i] = 1691;
      }
      if (array[i] > 4000000 && array[i] <= 6000000) {
        deedsarray[i] = 2051;
      }

      if (array[i] > 6000000 && array[i] <= 8000000) {
        deedsarray[i] = 2442;
      }

      if (array[i] > 8000000 && array[i] <= 10000000) {
        deedsarray[i] = 2854;
      }
      if (array[i] > 10000000 && array[i] <= 15000000) {
        deedsarray[i] = 3397;
      }
      if (array[i] > 15000000 && array[i] <= 20000000) {
        deedsarray[i] = 4080;
      }
      if (array[i] > 20000000 && array[i] <= 30000000) {
        deedsarray[i] = 4755;
      }
      if (array[i] > 30000000) {
        deedsarray[i] = 6794;
      }
    }

    let pp = Number(this.purchase_price.replace(/,/g, ''))
    if (pp <= 1000000) {
      this.transfer_duty = 0;
    }

    if (pp > 1000000 && pp <= 1375000) {
      this.transfer_duty = (pp - 1000000) * 0.03;

    }
    if (pp > 1375000 && pp <= 1925000) {
      this.transfer_duty = 11250 + (pp - 1375000) * 0.06;
    }
    if (pp > 1925000 && pp <= 2475000) {
      this.transfer_duty = 44250 + (pp - 1925000) * 0.08;
    }
    if (pp > 2475000 && pp <= 11000000) {
      this.transfer_duty = 88250 + (pp - 2475000) * 0.11;
    }

    if (pp > 11000000) {
      this.transfer_duty = 1026000 + (pp - 11000000) * 0.13;
    }

    if (pp > 0) {
      this.transfer_cost = conveyarray[0] + disbursetran + transfervat + deedsarray[0] + this.transfer_duty;
    }

    bondvat = (conveyarray[1] + disbursebond) * 0.15;

    if (Number(this.bond_amount.replace(/,/g, '')) > 0) {
      this.bond_cost = conveyarray[1] + disbursebond + bondvat + deedsarray[1];
    }

    this.conveyancing_fees = conveyarray[0];

  }

  reset() {
    this.purchase_price = "0";
    this.bond_amount = "0";
    this.transfer_duty = 0;
    this.conveyancing_fees = 5200;
    this.transfer_cost = 0;
    this.bond_cost = 0;
  }

  async share() {
    this.common.presentLoader();
    let url = await this.utilitySrvc.createDynamicLinkForCalculator("transfer-cost", btoa(JSON.stringify(this.transferCostObject)));
    if (url) {
      this.logger.log('PropertyMapPage : share : deeplinked share url', url);
      this.common.dismissLoader();
      await Plugins.Share.share({
        title: "Transfer Cost Calculator",
        text: "Open Transfer Cost Calculator in Showday Mobile App:",
        url: url.toString(),
        dialogTitle: 'Share With Friends & Family'
      });
    } else {
      this.common.dismissLoader();
      this.common.presentToast('Unable to generate a shareable link. Please contact support team.')
    }
  }

}
