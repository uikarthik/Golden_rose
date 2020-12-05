import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private getpost: GetpostService) { }

  CreateCategory(value) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.addcategory, value);
  }

  GetCategory() {
    return this.getpost.getMethod(Constants.url + Constants.listcategory)
  }

  GetAllCategory() {
    return this.getpost.getMethod(Constants.url + Constants.listallcategory)
  }

  enableCategory(val) {
    return this.getpost.getMethod(Constants.url + Constants.enablecategory + val)
  }

  deleteCategory(val) {
    return this.getpost.getMethod(Constants.url + Constants.deletecategory + val)
  }

  updateCategory(val) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.updatecategory, val)
  }

}
