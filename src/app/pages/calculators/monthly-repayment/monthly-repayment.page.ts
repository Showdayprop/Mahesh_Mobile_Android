import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Share } from '@capacitor/core';
import { LoggerService } from '../../../core/logger.service';
import { UtilityService } from '../../../providers/utilities.service';
import { Common } from '../../../shared/common';
import { Plugins } from '@capacitor/core';

@Component({
  selector: 'app-monthly-repayment',
  templateUrl: './monthly-repayment.page.html',
  styleUrls: ['./monthly-repayment.page.scss'],
})
export class MonthlyRepaymentPage implements OnInit {

  purchase_price = "0";
  deposite = "0";
  term = 30;
  interest_rate = 7.00;
  loan_amount = 0;
  monthly_loan_repayment = 0;
  
  monthlyLoanObject = {
    pp: this.purchase_price,
    deposite: this.deposite,
    term: this.term,
    interest_rate: this.interest_rate,
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
        this.deposite = homeLoanParsedObject.deposite;
        this.term = homeLoanParsedObject.term;
        this.interest_rate = homeLoanParsedObject.interest_rate
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
    this.monthlyLoanObject = {
      pp: this.purchase_price,
      deposite: this.deposite,
      term: this.term,
      interest_rate: this.interest_rate,
    }

    let loanval = 2;
    let rate = 1;
    let loanrepay = 0;
    loanval = Number(this.purchase_price.toString().replace(/,/g, '')) - Number(this.deposite.toString().replace(/,/g, ''));
    rate = this.interest_rate / 1200;
    loanrepay = (rate + rate / ((Math.pow(1 + rate, this.term * 12)) - 1)) * loanval;


    this.loan_amount = loanval;
    this.monthly_loan_repayment = (rate + rate / ((Math.pow(1 + rate, this.term * 12)) - 1)) * loanval;
  }

  reset(){
    this.purchase_price = "0";
    this.deposite = "0";
    this.term = 30;
    this.interest_rate = 7.00;
    this.loan_amount = 0;
    this.monthly_loan_repayment = 0;
  }

  async share() {
    this.common.presentLoader();
    let url = await this.utilitySrvc.createDynamicLinkForCalculator("monthly-repayment", btoa(JSON.stringify(this.monthlyLoanObject)));
    if (url) {
      this.logger.log('PropertyMapPage : share : deeplinked share url', url);
      this.common.dismissLoader();
      await Plugins.Share.share({
        title: "Monthly Loan Repayment Calculator",
        text: "Open Monthly Loan Repayment Calculator in Showday Mobile App:",
        url: url.toString(),
        dialogTitle: 'Share With Friends & Family'
      });
    } else {
      this.common.dismissLoader();
      this.common.presentToast('Unable to generate a shareable link. Please contact support team.')
    }
  }

}
