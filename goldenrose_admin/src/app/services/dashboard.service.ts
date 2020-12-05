import { Injectable } from '@angular/core';
import { GetpostService } from './getpost.service';
import { Constants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private getpost: GetpostService) { }

  DashboardAll() {
    return this.getpost.getMethod(Constants.url + Constants.dashboard);
  }

  CurrentGraph() {
    return this.getpost.getMethod(Constants.url + Constants.currentgraph);
  }

  PreviousGraph() {
    return this.getpost.getMethod(Constants.url + Constants.previousgraph);
  }

  Statics() {
    return this.getpost.getMethod(Constants.url + Constants.statics);
  }
}
