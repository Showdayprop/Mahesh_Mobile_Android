import { Injectable } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { messages } from './messages';

@Injectable()

export class Common {
    toast;
    loader;
    isLoading: boolean;
    DECIMAL_SEPARATOR=".";
    GROUP_SEPARATOR=",";

    constructor(private toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private call: CallNumber,
        private alertCtrl: AlertController) {
    }

    async presentToast(msgKey, header?: string, duration?: number, color?: string, closeButton?: boolean, closeBtnText?: string) {
        let msg = messages[msgKey] ? messages[msgKey] : msgKey;
        this.toast = await this.toastCtrl.create({
            header: header,
            message: msg,
            duration: duration ? duration : 3000,
            animated: true,
            position: 'bottom',
            color: color ? color : 'dark',
            showCloseButton: closeButton ? closeButton : false,
            closeButtonText: closeBtnText
        });
        this.toast.present();
        return await this.toast.onDidDismiss()
    }

    async presentLoader(msg?) {
        this.isLoading = true;
        return await this.loadingCtrl.create({
            spinner: 'circles',
            message: msg ? msg : 'Please wait...',
            translucent: true,
            cssClass: 'custom-class custom-loading',
            animated: true
        }).then(lo => {
            lo.present().then(() => {
                if (!this.isLoading) {
                    lo.dismiss()
                }
            })
        });
    }

    async dismissLoader() {
        if (this.isLoading) {
            try {
                return await this.loadingCtrl.dismiss();
            }
            catch (err) {
            }
            this.isLoading = false;
        }
        // this.isLoading = false;
        // return await this.loadingCtrl.dismiss();
    }
    async dismissAllLoaders() {
        let topLoader = await this.loadingCtrl.getTop();
        while (topLoader) {
            if (!(await topLoader.dismiss())) {
                throw new Error('Could not dismiss the topmost loader. Aborting...');
            }
            topLoader = await this.loadingCtrl.getTop();
        }
    }
    async getTopLoader() {
        return await this.loadingCtrl.getTop().then(res => {
            if (res) {
                return true;
            }
            else {
                return false;
            }
        })
    }
    async presentAlertForConfirmation(msgKey: string, header?: string, okButtonText?: string, cancelButtonText?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let msg = messages[msgKey] ? messages[msgKey] : msgKey;
            this.alertCtrl
                .create({
                    header: header,
                    message: msg,
                    backdropDismiss: false,
                    buttons: [
                        {
                            text: cancelButtonText ? cancelButtonText : 'Cancel',
                            handler: () => reject(false)
                        },
                        {
                            text: okButtonText ? okButtonText : 'Yes',
                            handler: () => resolve(true)
                        }
                    ]
                })
                .then(alert => {
                    alert.present();
                });
        });
    }

    presentPopupAlertForOK(msgKey, header?) {
        let msg = messages[msgKey] ? messages[msgKey] : msgKey;
        this.alertCtrl.create({
            header: header ? header : 'Alert',
            message: msg,
            backdropDismiss: false,
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        return true;
                    }
                }
            ]
        }).then(alert => {
            alert.present();
        })
    }
    obToquery(obj: any, prefix?: any) {
        let str = [];
        for (let p in obj) {
            let k = prefix ? prefix + '[' + p + ']' : p,
                v = obj[k];
            str.push((typeof (v) === 'object' && v !== null) ? this.obToquery(v, k) : (k) + '=' + encodeURIComponent(v));
        }
        return str.join('&');
        ``;
    }

    formatDate(date) {
        date = new Date(date);

        let day = ('0' + date.getDate()).slice(-2);
        let month = ('0' + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear();

        return year + '-' + month + '-' + day;
    }

    converSqlDateToJavascript(date) {
        // example MySQL DATETIME
        // const dateTime = '2017-02-04 11:23:54';

        let dateTimeParts: any = date.split(/[- :]/); // regular expression split that creates array with: year, month, day, hour, minutes, seconds values
        dateTimeParts[1]--; // monthIndex begins with 0 for January and ends with 11 for December so we need to decrement by one

        return new Date(...dateTimeParts as [number, number, number, number, number, number]); // our Date object
    }
    diff_hours(dt2, dt1) {
        let diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60);
        return Number(diff).toPrecision(4);
    }

    confirmToCall(number) {
        // this.presentAlertForConfirmation('Confirm to call ' + number, 'Call').then(() => {
        this.call.callNumber(number, true)
        // }).catch((err) => console.log('cancelled'))
    }

    format(ev) {
        let valString = ev && ev.target && ev.target.value ? ev.target.value : ev
        if (!valString) {
            return '';
        }
        let val = valString.toString();
        const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
        return parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR)
    };

    unFormat(val) {
        if (!val) {
            return '';
        }
        val = val.replace(/^0+/, '').replace(/\D/g,'');
        if (this.GROUP_SEPARATOR === ',') {
            return val.replace(/,/g, '');
        } else {
            return val.replace(/\./g, '');
        }
    };
}
