import { Component, OnInit } from '@angular/core';
import { TypeserviceService } from 'src/app/services/typeservice.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Constants } from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-typelist',
  templateUrl: './typelist.component.html',
  styleUrls: ['./typelist.component.less']
})
export class TypelistComponent implements OnInit {

  listOfData = [];
  searchTextChanged = new Subject<string>();
  searchValue = '';
  resultlist = [];
  url=Constants.baseUrl;
  constructor(private type: TypeserviceService, private message: NzMessageService,private modal: NzModalService) { }

  ngOnInit(): void { 
      this.GetAllType();
  }

  public GetAllType() {
      this.type.GetAllType().subscribe(res => {
          if (res['success']) {
              this.resultlist = res['data'];
              this.listOfData = [...this.resultlist];
              this.searchTextChanged.pipe(debounceTime(300)).subscribe((val) => {
                  if (val == "") {
                      this.listOfData = [...this.resultlist];
                  } else {
                      this.listOfData = this.resultlist.filter((item) => {
                          if (item.name) {
                              if (item.name.toLowerCase().includes(val.toLowerCase()))
                                  return item.name.toLowerCase().includes(val.toLowerCase());
                          }
                          
                      });
                  }
              });
          }
      })
  }

  Search() {
      this.searchTextChanged.next(this.searchValue);
  }

  public EnableType(data) {
      this.type.enableType(data._id).subscribe(res => {
        if (res['success']) {
          data.status = data.status ? false : true;
          this.message.success(res["message"]);
        } else {
          this.message.error(res["message"]);
        }
      });
    }

    confirmModal?: NzModalRef;
    deleteCoupon(id): void {
      this.confirmModal = this.modal.confirm({
        nzTitle: 'Do you want to delete this Type?',
        nzContent: 'The Type will be deleted permanently.',
        nzOnOk: () =>{
          this.DeleteType(id);
        }
          // new Promise((resolve, reject) => {
          //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
          // }).catch(() => console.log('Oops errors!')),
      });
    }

    DeleteType(id): void {
      this.type.deleteType(id).subscribe(res => {
        if (res['success']) {
          this.message.success(res['message']);
          this.GetAllType();
        } else {
          this.message.error(res['message']);
        }
      })
    }
}
