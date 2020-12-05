import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import "rxjs/Rx";
import "rxjs/add/operator/catch";
import { Observable, throwError } from "rxjs";
 import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({
  providedIn: 'root'
})
export class GetpostService {

  public header: any;
  fileheader: { headers: HttpHeaders };

  constructor(
    private http: HttpClient,
    private router: Router,
     private message: NzMessageService
  ) { }

  SetHeader() {
    const headers = new HttpHeaders({
      // 'Access-Control-Allow-Origin': '*',
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("auth_token") ? localStorage.getItem("auth_token") : ""
    });
    this.header = { headers: headers };

    const fileheader = new HttpHeaders({
      Authorization: localStorage.getItem("auth_token") ? localStorage.getItem("auth_token") : ""
    });
    this.fileheader = { headers: fileheader };

  }

  ClearCookie() {
    localStorage.clear();
    localStorage.removeItem("user");
    this.router.navigate(["/auth"]);
  }

  getMethod(url): Observable<any> {
    this.SetHeader();
    return this.http.get(url, this.header).catch(err => {
      if (err.status === 401) {
        this.ClearCookie();
      } else {
         this.message.error(err);
        return throwError(err);
      }
    });
  }

  postMethodHeader(url, header): Observable<any> {
    return this.http.post(url, {}, header).catch(err => {
      if (err.status === 401) {
        this.ClearCookie();
      } else {
         this.message.error(err.error.message);
        return throwError(err);
      }
    });
  }

  postMethod(url, value) {
    this.SetHeader();
    return this.http.post(url, value, this.header).catch(err => {
      if (err.status === 401) {
        this.ClearCookie();
      } else {
         this.message.error(err.error.message);
        return throwError(err);
      }
    });
  }

  fileUploadMethod(url, value) {
    this.SetHeader();
    return this.http.post(url, value, this.fileheader).catch(err => {
      if (err.status === 401) {
        this.ClearCookie();
      } else if (err.status === 400) {
         this.message.error(err.error.message);
      } else {
        this.message.error(err.error.message);
        return throwError(err);
      }
    });
  }
}
