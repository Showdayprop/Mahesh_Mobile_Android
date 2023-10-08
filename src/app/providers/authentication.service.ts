import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    userData: any;

    constructor(
        public http: HttpClient
    ) {
    }

    processLogin(login, password, deviceId): Observable<any> {
        return this.http.post(environment.config.apiEndPoint + 'AuthRequests/login', {
            login_id: login,
            password,
            device_id: deviceId
        }).pipe(
            map(this.extractData),
            catchError(this.handleError)
        );
    }

    loginwsm(idToken, deviceId){
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization-key': idToken
          });
        return this.http.post(environment.config.apiEndPoint + 'AuthRequests/loginsm', {
            device_id: deviceId
        }, { headers: headers }).pipe(
            map(this.extractData),
            catchError(this.handleError)
        );
    }

    processSignup(firstName,
        surname,
        emailAddress,
        mobileNumber,
        loginId,
        password,
        deviceId,
        countryCode,
        acceptTerms,
        accountType,
        roles,
        loginsm): Observable<any> {
        return this.http.post(environment.config.apiEndPoint + 'AuthRequests/signup', {
            first_name: firstName,
            surname,
            login_id: loginId,
            email_address: emailAddress,
            mobile_number: mobileNumber,
            password,
            device_id: deviceId,
            country_code: countryCode.toLowerCase(),
            accept_terms: acceptTerms,
            account_type: accountType,
            roles: roles,
            loginsm: loginsm,
        }).pipe(
            map(this.extractData),
            catchError(this.handleError)
        );
    }
    serviceProviderSignup(data) {
        return this.http.post(environment.config.apiEndPoint + 'AuthRequests/provider_signup', data)
    }

    getMe(): Observable<any> {
        const params = {};

        return this.http.get(environment.config.apiEndPoint + 'AuthRequests/me', { params }).pipe(
            map(this.extractData),
            catchError(this.handleError)
        );
    }

    // setUserData(userData) {
    //     this.userData = userData;
    // }

    // getUserData() {
    //     return this.userData;
    // }

    // Private
    private extractData(res: Response) {
        const body = res;
        return body || {};
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const err = error || '';
            errMsg = `${error}`;
        } else {
            errMsg = error.error;
        }

        return throwError(errMsg);
    }
    logout() {
        return this.http.post(environment.config.apiEndPoint + 'AuthRequests/logout', {})
    }

    forgotPassword(params) {
        return this.http.post(environment.config.apiWebEndPoint + 'AuthController/retrieve_password', params)
    }

    updatePassword(params) {
        return this.http.post(environment.config.apiEndPoint + 'AuthRequests/update_password', params)
    }

    updateUserRoles(params) {
        return this.http.post(environment.config.apiEndPoint + 'AuthRequests/update_roles', params)
    }

    updateUserInfo(params) {
        return this.http.post(environment.config.apiEndPoint + 'AuthRequests/update_user', params)
    }

    getProfile() {
        return this.http.get(environment.config.apiEndPoint + 'AuthRequests/profile').pipe(
            map(this.extractData),
            catchError(this.handleError)
        );
    }
}
