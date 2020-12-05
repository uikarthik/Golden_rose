import { Injectable } from '@angular/core';
import { Constants } from '../shared/constants/constants';
import { GetpostService } from './getpost.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private getpost: GetpostService) { }

  CreateUser(value) {
    return this.getpost.postMethod(Constants.url + Constants.createuser, value);
  }

  GetallUser() {
    return this.getpost.getMethod(Constants.url + Constants.getAllUser);
  }

  UpdateUser(value) {
    return this.getpost.postMethod(Constants.url + Constants.updateuser, value);
  }

  GetUserById(id) {
    return this.getpost.getMethod(Constants.url + Constants.getuserbyid + id);
  }

  DeleteUserById(id) {
    return this.getpost.postMethod(Constants.url + Constants.userdelete ,id);
  }
}
