import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private getpost: GetpostService) { }

  Create(value) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.sitesetting, value);
  }

  CommonDiscount(value) {
    return this.getpost.postMethod(Constants.url + Constants.commondiscount, value);
  }

  GetSetting() {
    return this.getpost.getMethod(Constants.url + Constants.getsetting);
  }

  AdminActivity() {
    return this.getpost.getMethod(Constants.url + Constants.adminactivity);
  }

  GetErrorLogs() {
    return this.getpost.getMethod(Constants.url + Constants.getlog);
  }

  DeleteLog(id) {
    return this.getpost.getMethod(Constants.url + Constants.deletelog + id);
  }

   DeleteAllLog() {
    return this.getpost.getMethod(Constants.url + Constants.deletealllog);
  }

  
  GetENV() {
    return this.getpost.getMethod(Constants.url + Constants.getenv);
  }

  UpdateENV(value) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.updateenv, value);
  }

  ChangeENV(value) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.changeenv, value);
  }

  RestartServer() {
    return this.getpost.getMethod(Constants.url + Constants.restartserver);
  }
}
