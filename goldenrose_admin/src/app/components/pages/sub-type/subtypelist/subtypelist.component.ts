import { Component, OnInit } from '@angular/core';
import { SubtypeService } from 'src/app/services/subtype.service'
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-subtypelist',
  templateUrl: './subtypelist.component.html',
  styleUrls: ['./subtypelist.component.less']
})
export class SubtypelistComponent implements OnInit {

  listOfData = [];
  searchTextChanged = new Subject<string>();
  searchValue = '';
  resultlist = [];
 
  constructor(private subtype: SubtypeService, private message: NzMessageService,private modal: NzModalService) { }

  ngOnInit(): void { 
    this.GetAllType();
}

public GetAllType() {
    this.subtype.GetAllSubType().subscribe(res => {
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
    this.subtype.enableSubType(data._id).subscribe(res => {
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
    });
  }

  DeleteType(id): void {
    this.subtype.deleteSubType(id).subscribe(res => {
      if (res['success']) {
        this.message.success(res['message']);
        this.GetAllType();
      } else {
        this.message.error(res['message']);
      }
    })
  }

}
