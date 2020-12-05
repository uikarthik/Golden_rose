import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private getpost: GetpostService) { }

  StatusChange(val) {
    return this.getpost.postMethod(Constants.url + Constants.changestatus,val);
  }

  OrderbyId(val) {
    return this.getpost.getMethod(Constants.url + Constants.orderbyid + val);
  }

  OrderList() {
    return this.getpost.getMethod(Constants.url + Constants.orderlist);
  }

  OrderByStatus(val) {
    return this.getpost.getMethod(Constants.url + Constants.orderbystatus + val);
  }
  
}
