import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { OrderService } from '../../../services/order.service';
import { NzMessageService } from "ng-zorro-antd/message";
import { Subscription, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.less'],
})
export class OrdersComponent implements OnInit {
    // Table -- Recent Orders

    RecentOrder = [];
    orderStatus;
    isshow = 'true';

    searchValue = '';
    searchList = [];
    // modeText = "ALL";
    searchTextChanged = new Subject<string>();
    status = 'ORDERED';

    constructor(private dash: DashboardService, private order: OrderService, private message: NzMessageService) { }

    ngOnInit(): void {
        // this.getOrderList();
        this.changeStatus(this.status);
    }

    getOrderList() {
        this.order.OrderList().subscribe(res => {
            if (res['success']) {
                this.RecentOrder = res['data'];
                this.searchList = this.RecentOrder;
                this.RecentOrder = [...this.searchList];
                this.searchTextChanged.pipe(debounceTime(300)).subscribe((val) => {
                    if (val == "") {
                        this.RecentOrder = [...this.searchList];
                    } else {
                        this.RecentOrder = this.searchList.filter((item) => {
                            if (item.address.user_name) {
                                if (item.address.user_name.toLowerCase().includes(val.toLowerCase()))
                                    return item.address.user_name.toLowerCase().includes(val.toLowerCase());
                            }
                        }
                        );
                    }
                })
            }
        })
    }
    Search() {
        this.searchTextChanged.next(this.searchValue);
    }
    order_id;
    isOrder = false;

    editOrder(data, i): void {
        this.isOrder = true;
        this.order_id = data._id;
        this.orderStatus = i
    }

    updateStatus() {
        let val = {
            id: this.order_id,
            order_status: this.orderStatus
        }
        this.order.StatusChange(val).subscribe(res => {
            if (res['success']) {
                this.message = res['message'];
                this.getOrderList();
                this.isOrder = false;
            }
            else {
                this.message = res['message']
            }
        })
    }

    changeStatus(val) {
        if (this.status == 'ALL') {
            this.getOrderList();
        }
        else {
            this.order.OrderByStatus(val).subscribe((res) => {
                if (res['success']) {
                    this.RecentOrder = res['data']
                }
            });
        }
    }

}
