import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserService } from '../../../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-user-view',
    templateUrl: './user-view.component.html',
    styleUrls: ['./user-view.component.less'],
})
export class UserViewComponent implements OnInit {
    /*--------------------------------
	Table -- Current Order
	--------------------------------*/
    currentOrder = [
        {
            date: 'July 8, 2020',
            amount: 130,
            orderID: 121093,
        },
    ];

    /*--------------------------------
	Table -- Past Order
	--------------------------------*/
    pastOrder = [
        {
            date: 'July 8, 2020',
            amount: 130,
            orderID: 121093,
        },
    ];

    /*--------------------------------
	Table -- Reviews 
	--------------------------------*/
    reviewsData = [
        {
            date: 'July 8, 2020',
            amount: 130,
            productName: 'Rings',
            review: 'The Rings is very expensive and underrated.',
        },
    ];

    /*--------------------------------
	Table -- Referrals
	--------------------------------*/
    referralData = [
        {
            date: 'July 8, 2020',
            referrerName: 'John Bruto',
        },
    ];

    /*----------------------------------
    Table -- Coupon
    -----------------------------------*/
    couponData = [];
    cardData = [];
    username:any=[];
    email;
    gender;
    mobile;
    address = [];
    orderHistory = [];

    constructor(private modalService: NzModalService,private user:UserService,private activatedRoute: ActivatedRoute) {}

    ngOnInit(): void {
        let userId = this.activatedRoute.snapshot.paramMap.get("id");
        this.GetUserById(userId);
       
    }
    GetUserById(userId) {
        this.user.GetUserById(userId).subscribe(res => {
            this.username = res['data']['user']['user_name'];
            this.mobile = res['data']['user']['mobile'];
            this.gender = res['data']['user']['gender'];
            this.email = res['data']['user']['email'];
            this.couponData = res['data']['user']['coupon'];
            this.address = res['data']['user']['address'];
            this.cardData = res['data']['card'];
            this.orderHistory = res['data']['order'];
        })
    }

    deleteReview(): void {
        this.modalService.confirm({
            nzTitle: 'Delete Review',
            nzContent: 'Are you sure want to delete this review?',
            nzOkText: 'Yes, Delete it',
            nzCancelText: 'Cancel',
        });
    }
}
