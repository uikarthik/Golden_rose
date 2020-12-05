import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ProductService } from 'src/app/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/shared/constants/constants';
@Component({
    selector: 'app-product-view',
    templateUrl: './product-view.component.html',
    styleUrls: ['./product-view.component.less'],
})
export class ProductViewComponent implements OnInit {
    /*-----------------------------
    Image Change On Hover
    ------------------------------*/
    url=Constants.baseUrl;
    imgThumbnail1 = [];
    popUpImg;
    productsize;

    resultdata=[];
    over(imgIn) {
        this.popUpImg = imgIn;
    }

    out(imgOut) {
        this.popUpImg = imgOut;
    }

    /*-----------------------------
    Table -- Reviews
    ------------------------------*/
    listOfData = [];
name;
product_id;
gender;
rating;
description;
size=[];
price=[];
stock_available;
oneprice;

    confirmModal?: NzModalRef; // For testing by now
productid;
    constructor(private modal: NzModalService, private product: ProductService,private activatedRoute: ActivatedRoute,) { }

    ngOnInit(): void {
        this.productid = this.activatedRoute.snapshot.paramMap.get("id");

        this.getAllProduct(this.productid);
        
   
    }
    public getAllProduct(id) {
        this.product.GetProduct().subscribe(res => {
             for (let el of res.data) {
                if (el._id == id) {
                  this.name = el['name'];
                  this.gender =el['gender'];
                  this.resultdata = el['review'];
                  this.description = el['description'];
                  this.rating = el['ratings'];
                  this.size=el['size'];
                  this.product_id=el['product_id'];
                  this.price = el['price'];
                  this.stock_available = el['stock_available'];
                  this.imgThumbnail1=el['file'];
                  this.popUpImg = this.url+this.imgThumbnail1[0].path;
                }
            }
        });
    }
    /*-----------------------------
    Modal -- Reviews Delete
    ------------------------------*/
    showConfirm(): void {
        this.confirmModal = this.modal.confirm({
            nzTitle: 'Do you want to delete this review?',
            nzContent:
                'This review will be removed permanently from the product.',
            nzOnOk: () =>
                new Promise((resolve, reject) => {
                    setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                }).catch(() => console.log('Oops errors!')),
        });
    }

    productPrice(id){
        this.oneprice = this.price[id];
        console.log(id,this.oneprice)
    }
}
