import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private getpost: GetpostService) { }

  SendNotification(value) {
    return this.getpost.postMethod(Constants.url + Constants.sendnotification, value);
  }

  ListNotification() {
    return this.getpost.getMethod(Constants.url + Constants.listnotification);
  }

  DeleteNotification(id) {
    return this.getpost.getMethod(Constants.url + Constants.delnotification + id);
  }
  
}
