import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
  selector: 'app-errorlog',
  templateUrl: './errorlog.component.html',
  styleUrls: ['./errorlog.component.less']
})
export class ErrorlogComponent implements OnInit {

  id;
  listOfData = [];
  isOkLoading = false;

  constructor(
    private siteSettingsService: SettingsService,
    private router: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.id = this.router.snapshot.paramMap.get("id");
  }

  ngOnInit(): void {
    this.GetLog();
  }

  public GetLog() {
    this.siteSettingsService.GetErrorLogs().subscribe(res => {
      if (res['success']) {
        const newData = Object.entries(res["data"]).map((item) => ({
          id: item[0],
          data: item[1],
        }));
        this.listOfData = newData.reverse();
      } else {
        this.message.error(res['message']);
      }
    })
  }

  public DateConversion() {
    let newArr = [];
    for (let val of this.listOfData) {
      let newObj = {
        date: Object.keys(val)[0]
      }
      newArr.push(newObj)
    }
  }

  public DeleteLog(id) {
    this.siteSettingsService.DeleteLog(id).subscribe(res => {
      if (res['success']) {
        this.message.success(res['message']);
        this.GetLog();
      } else {
        this.message.error(res['message']);
      }
    });
  }

  public DeleteAllLog() {
    this.siteSettingsService.DeleteAllLog().subscribe(res => {
      if (res['success']) {
        this.message.success(res['message']);
        this.GetLog();
      } else {
        this.message.error(res['message']);
      }
    });
  }

  cancel() {
  }
}
