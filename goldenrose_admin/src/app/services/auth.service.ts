import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private getpost: GetpostService) { }
  getToken() {
    return localStorage.getItem('isLoggedIn');
  }

  isLoggednIn() {
    const result = this.getToken();
    return (result === 'active' ? true : false);
  }

  login(value) {
    return this.getpost.postMethod(Constants.url + Constants.login, value);
  }
  ForgotPassword(value) {
    return this.getpost.postMethod(Constants.url + Constants.forgotPassword, value);
  }
  ResetPassword(value) {
    return this.getpost.postMethod(Constants.url + Constants.resetPassword, value);
  }
  ChangePassword(value) {
    return this.getpost.postMethod(Constants.url + Constants.changePassword, value);
  }
  VerifyEmail() {
    return this.getpost.getMethod(Constants.url + Constants.verifyemail);
  }

  Getprofile() {
    return this.getpost.getMethod(Constants.url + Constants.getprofile);
  }

  GetG2F() {
    return this.getpost.getMethod(Constants.url + Constants.getg2f);
  }

  EnableG2F(value) {
    return this.getpost.postMethod(Constants.url + Constants.enableg2f, value);
  }

  DisableG2F(value) {
    return this.getpost.postMethod(Constants.url + Constants.disableg2f, value);
  }

  VerifyG2F(value) {
    return this.getpost.postMethod(Constants.url + Constants.verifyg2f, value);
  }

  logOut() {
    localStorage.clear();
    this.getpost.ClearCookie();
  }
}
