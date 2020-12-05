import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  constructor(private getpost: GetpostService) { }

  CouponCreate(value) {
    return this.getpost.postMethod(Constants.url + Constants.couponcreate, value);
  }

  CouponUpdate(value) {
    return this.getpost.postMethod(Constants.url + Constants.couponupdate, value);
  }

  CouponList() {
    return this.getpost.getMethod(Constants.url + Constants.couponlist);
  }

  DeleteCoupon(id) {
    return this.getpost.getMethod(Constants.url + Constants.deletecoupon + id);
}

  CouponStatus(id) {
    return this.getpost.getMethod(Constants.url + Constants.couponstatus + id);
  }

  // CouponGetdetails(id) {
  //   return this.getpost.getMethod(Constants.url + Constants.coupongetdetails + id);
  // }
}
