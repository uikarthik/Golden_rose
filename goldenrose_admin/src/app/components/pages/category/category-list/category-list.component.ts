import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service'
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Constants } from 'src/app/shared/constants/constants';

@Component({
    selector: 'app-category-list',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.less'],
})
export class CategoryListComponent implements OnInit {
    // Table -- Recent Orders
    listOfData = [];
    searchTextChanged = new Subject<string>();
    searchValue = '';
    resultlist = [];
    url=Constants.baseUrl;
    constructor(private category: CategoryService, private message: NzMessageService,private modal: NzModalService) { }

    ngOnInit(): void { 
        this.GetAllCategory();
    }

    public GetAllCategory() {
        this.category.GetAllCategory().subscribe(res => {
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

    public EnableCategory(data) {
        this.category.enableCategory(data._id).subscribe(res => {
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
          nzTitle: 'Do you want to delete this category?',
          nzContent: 'The category will be deleted permanently.',
          nzOnOk: () =>{
            this.DeleteCategory(id);
          }
            // new Promise((resolve, reject) => {
            //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
            // }).catch(() => console.log('Oops errors!')),
        });
      }

      DeleteCategory(id): void {
        this.category.deleteCategory(id).subscribe(res => {
          if (res['success']) {
            this.message.success(res['message']);
            this.GetAllCategory();
          } else {
            this.message.error(res['message']);
          }
        })
      }
}

