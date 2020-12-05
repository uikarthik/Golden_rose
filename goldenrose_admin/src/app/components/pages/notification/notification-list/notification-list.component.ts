import { Component, OnInit } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NzMessageService } from "ng-zorro-antd/message";
import { Subscription, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
    selector: 'app-notification-list',
    templateUrl: './notification-list.component.html',
    styleUrls: ['./notification-list.component.less'],
})
export class NotificationListComponent implements OnInit {
    /*---------------------------
  	Table -- Product List
      ----------------------------*/
      searchTextChanged = new Subject<string>();
  searchValue = '';
  resultlist = [];
    listOfData = [];

    constructor( private notification:NotificationsService, private message:NzMessageService) {}

    ngOnInit(): void {
        this.getAllNotification();
    }
    Search() {
        this.searchTextChanged.next(this.searchValue);
      }
    getAllNotification(){
        this.notification.ListNotification().subscribe(res=>{
            if (res['success']) {
                this.resultlist = res['data'];
                this.listOfData = [...this.resultlist];
                this.listOfData = this.listOfData.reverse();
                this.searchTextChanged.pipe(debounceTime(300)).subscribe((val) => {
                  if (val == "") {
                    this.listOfData = [...this.resultlist];
                  } else {
                    this.listOfData = this.resultlist.filter((item) => {
                      if (item.tile) {
                        if (item.title.toLowerCase().includes(val.toLowerCase()))
                          return item.title.toLowerCase().includes(val.toLowerCase());
                      }
                      if (item.message) {
                        if (item.message.toLowerCase().includes(val.toLowerCase()))
                          return item.message.toLowerCase().includes(val.toLowerCase());
                      }
                    });
                  }
                });
              }
        })
    }
    deleteNotification(id): void {
		this.notification.DeleteNotification(id).subscribe(res => {
			if (res['success']) {
				this.message.success(res['message']);
				this.getAllNotification();
			} else {
				this.message.error(res['message']);
			}
		})
	}
}
