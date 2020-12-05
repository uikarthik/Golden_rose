import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { OrderService } from 'src/app/services/order.service';
import { NzMessageService } from "ng-zorro-antd/message";
import { Constants } from 'src/app/shared/constants/constants';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

@Component({
    selector: 'app-order-details',
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.less'],
})
export class OrderDetailsComponent implements OnInit {
    // Table -- Recent Orders
    listOfData = [];
    resultData: any = [];
    address: any = [];
    orderStatus;
    url = Constants.baseUrl;
    step = 0;
    // Table -- Summary Orders
    listOfSummaryOrder = [];
    validateForm!: FormGroup;

    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
        if (this.validateForm.valid) {
            this.updateStatus();
        }
    }
    productId;
    constructor(private fb: FormBuilder, private msg: NzMessageService, private order: OrderService, private dash: DashboardService, private route: ActivatedRoute, private product: ProductService) { }

    ngOnInit(): void {
        this.productId = this.route.snapshot.paramMap.get('id');

        this.validateForm = this.fb.group({
            order: [null, [Validators.required]],
        });
        this.getOrderDetails();

    }

    getOrderDetails() {
        this.order.OrderbyId(this.productId).subscribe(res => {
            if (res['success']) {
                this.listOfData = res['data']['product'];
                this.resultData = res['data'];
                this.orderStatus = this.resultData['order_status']
                this.address = this.resultData['address'];

                if (this.orderStatus == 'ORDERED') {
                    this.step = 0;
                }
                else if (this.orderStatus == 'PACKED') {
                    this.step = 1;
                }
                else if (this.orderStatus == 'SHIPPED') {
                    this.step = 2;
                }
                else if (this.orderStatus == 'DELIVERED') {
                    this.step = 3;
                }
                else {
                    this.step = 0;
                }
              
            }
        })
    }

    updateStatus() {
        let val = {
            id: this.productId,
            order_status: this.orderStatus
        }
        this.order.StatusChange(val).subscribe(res => {
            if (res['success']) {
                this.msg.success(res['message'])
                this.resultData = res['data']
                this.orderStatus = this.resultData['order_status']
                this.address = this.resultData['address'];

                if (this.orderStatus == 'ORDERED') {
                    this.step = 0;
                }
                else if (this.orderStatus == 'PACKED') {
                    this.step = 1;
                }
                else if (this.orderStatus == 'SHIPPED') {
                    this.step = 2;
                }
                else if (this.orderStatus == 'DELIVERED') {
                    this.step = 3;
                }
                else {
                    this.step = 0;
                }
            }
            else {
                this.msg.error(res['message'])
            }
        })
    }

    isLoading = false;

    //PDF
    public convetToPDF() {
        this.isLoading = true;
          
        var data = document.getElementById('content');
        html2canvas(data).then(canvas => {
            this.isLoading = true;
          // Few necessary setting options
          var imgWidth = 208;
          var pageHeight = 295;
          var imgHeight = canvas.height * imgWidth / canvas.width;
          var heightLeft = imgHeight;
    
          const contentDataURL = canvas.toDataURL('image/png')
          let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
          var position = 0;
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
          pdf.save('orderInvoice.pdf'); // Generated PDF
          this.isLoading = false;
        });
      }
    
}
