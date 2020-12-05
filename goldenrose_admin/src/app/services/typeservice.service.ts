import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class TypeserviceService {

  constructor(private getpost: GetpostService) { }

  CreateType(value) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.typecreate, value);
  }

  GetType() {
    return this.getpost.getMethod(Constants.url + Constants.typelist)
  }

  GetAllType() {
    return this.getpost.getMethod(Constants.url + Constants.typelistall)
  }

  enableType(val) {
    return this.getpost.getMethod(Constants.url + Constants.typestaus + val)
  }

  deleteType(val) {
    return this.getpost.getMethod(Constants.url + Constants.typedelete + val)
  }

  updateType(val) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.typeupdate, val)
  }
}
