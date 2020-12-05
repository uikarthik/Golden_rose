import { Component, OnInit } from '@angular/core';
import { Subscription, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProductService } from 'src/app/services/product.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CategoryService } from 'src/app/services/category.service'
import { Constants } from 'src/app/shared/constants/constants';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.less'],
})
export class ProductListComponent implements OnInit {
  /*---------------------------
  Table -- Product List
  ----------------------------*/
  listOfData = [];
  category_list = [];
  categoryname;
  searchTextChanged = new Subject<string>();
  searchValue = '';
  resultlist: Array<{
    id: number; productname: string; rating: number; addeddate: any; price: any; quantity: any;
    availability: any; imagelist: any; category_name: any; product_id: any; status: any,offer_percentage:any
  }> = [];
  url = Constants.baseUrl;

  constructor(private product: ProductService, private category: CategoryService, private message: NzMessageService, private modal: NzModalService) { }

  ngOnInit(): void {
    this.getCategory();
    setTimeout(() => {                           //<<<---using ()=> syntax
      this.GetAllProduct();
    }, 2000);

  }
  getCategory() {
    this.category.GetCategory().subscribe(res => {
      this.category_list = res['data'];
    });
  }

  public GetAllProduct() {
    this.listOfData = [];
    this.resultlist=[];
    this.product.GetProduct().subscribe(res => {
      if (res['success']) {
        for (let i = 0; i < res['data'].length; i++) {
          for (let j = 0; j < this.category_list.length; j++) {
            if (this.category_list[j]._id === res['data'][i]['category_id']) {
              this.categoryname = this.category_list[j]['name'];
            }
          }
          this.resultlist.push({
            id: i,
            productname: res['data'][i]['name'],
            rating: res['data'][i]['ratings'],
            addeddate: res['data'][i]['createdAt'],
            price: res['data'][i]['price'],
            quantity: res['data'][i]['stock_count'],
            offer_percentage: res['data'][i]['offer_percentage'],
            availability: res['data'][i]['stock_available'],
            imagelist: res['data'][i]['file'],
            category_name: this.categoryname,
            product_id: res['data'][i]['_id'],
            status: res['data'][i]['status']
          })
        }
        this.listOfData = [...this.resultlist];
        this.searchTextChanged.pipe(debounceTime(300)).subscribe((val) => {
          if (val == "") {
            this.listOfData = [...this.resultlist];
          } else {
            this.listOfData = this.resultlist.filter((item) => {
              if (item.category_name) {
                if (item.category_name.toLowerCase().includes(val.toLowerCase()))
                  return item.category_name.toLowerCase().includes(val.toLowerCase());
              }
              if (item.productname) {
                if (item.productname.toLowerCase().includes(val.toLowerCase()))
                  return item.productname.toLowerCase().includes(val.toLowerCase());
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
  public enableProduct(data) {
    this.product.EnableProduct(data.product_id).subscribe(res => {
      if (res['success']) {
        data.status = data.status ? false : true;
        this.message.success(res["message"]);
      } else {
        this.message.error(res["message"]);
      }
    });
  }

  confirmModal?: NzModalRef;
  delete(id,ind): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: 'Do you want to delete this Product?',
      nzContent: 'The Product will be deleted permanently.',
      nzOnOk: () => {
        this.deleteProduct(id.product_id,ind);
      }
      // new Promise((resolve, reject) => {
      //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
      // }).catch(() => console.log('Oops errors!')),
    });
  }

  deleteProduct(id,i): void {
    this.product.DeleteProduct(id).subscribe(res => {
      if (res['success']) {
        this.message.success(res['message']);
        this.GetAllProduct();
       
      } else {
        this.message.error(res['message']);
      }
    })
  }
}
