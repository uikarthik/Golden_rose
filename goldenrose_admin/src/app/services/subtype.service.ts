import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class SubtypeService {

  constructor(private getpost: GetpostService) { }

  CreateSubType(value) {
    return this.getpost.postMethod(Constants.url + Constants.subtypecreate, value);
  }

  GetSubType() {
    return this.getpost.getMethod(Constants.url + Constants.subtypelist)
  }

  GetAllSubType() {
    return this.getpost.getMethod(Constants.url + Constants.subtypelistall)
  }

  enableSubType(val) {
    return this.getpost.getMethod(Constants.url + Constants.subtypestaus + val)
  }

  deleteSubType(val) {
    return this.getpost.getMethod(Constants.url + Constants.subtypedelete + val)
  }

  updateSubType(val) {
    return this.getpost.postMethod(Constants.url + Constants.subtypeupdate, val)
  }
}
