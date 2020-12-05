import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})

export class LocaleService {

  constructor(private getpost: GetpostService) { }

  LocaleCreate(val) {
    return this.getpost.postMethod(Constants.url + Constants.localecreate, val);
  }

  LocaleUpdate(val) {
    return this.getpost.postMethod(Constants.url + Constants.localeupdate, val);
  }

  LocaleGetall() {
    return this.getpost.getMethod(Constants.url + Constants.localegetall);
  }

  LocaleDelete(val) {
    return this.getpost.postMethod(Constants.url + Constants.localedelete, val);
  }

  LocaleAddKey(val) {
    return this.getpost.postMethod(Constants.url + Constants.localeaddkey, val);
  }

  LocaleGetFile(val) {
    return this.getpost.getMethod(Constants.url + Constants.localegetfile + val);
  }

  LocaleStatus(val) {
    return this.getpost.getMethod(Constants.url + Constants.localestatus + val)
  }

}
