import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private getpost: GetpostService) { }

  CreateProduct(value) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.createproduct, value);
  }

  ImportFile(value) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.importfile, value);
  }

  GetProduct() {
    return this.getpost.getMethod(Constants.url + Constants.productlist)
  }
  EnableProduct(val) {
    return this.getpost.getMethod(Constants.url + Constants.enableproduct + val)
  }

  DeleteProduct(val) {
    return this.getpost.getMethod(Constants.url + Constants.productdelete + val)
  }

  updateProduct(val) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.updateproduct, val)
  }

  DeleteImage(val){
    return this.getpost.postMethod(Constants.url + Constants.deleteimage,val)
  }

  UpdateFile(value) {
    return this.getpost.fileUploadMethod(Constants.url + Constants.productupdate, value);
  }

}
