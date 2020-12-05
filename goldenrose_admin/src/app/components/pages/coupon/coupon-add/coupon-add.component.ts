import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CouponService } from '../../../../services/coupon.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-coupon-add',
    templateUrl: './coupon-add.component.html',
    styleUrls: ['./coupon-add.component.less'],
})
export class CouponAddComponent implements OnInit {
    /*---------------------------
    Form -- Send Notification
    -----------------------------*/
    validateForm!: FormGroup;
    editLoading=false;
    couponPercentage = 0;
    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
        if(this.validateForm.valid){
            this.editLoading = true;
            this.AddCoupon();
        }
    }
    max100() {
        this.couponPercentage = this.couponPercentage > 100 ? 100 : this.couponPercentage;
        this.couponPercentage = this.couponPercentage < 0 ? 0 : this.couponPercentage;
      }

    public AddCoupon() {
        let val = {
           title: this.validateForm.value.couponName,
          couponcode: this.validateForm.value.couponCode,
          validitydays: this.validateForm.value.validitydays,
          percentage: this.validateForm.value.percentage,
          description: this.validateForm.value.description,
    
        }
        // console.log(val,'edit coupon')
        this.couponService.CouponCreate(val).subscribe(res => {
          if (res['success']) {
              this.editLoading= false;
             this.message.success(res["message"]);
              this.router.navigate(['/coupon/list']);
          }
          else{
            this.editLoading = false;
              this.message.error(res['message']);
          }
        });
      }
    constructor(private fb: FormBuilder,private couponService: CouponService,
        private message: NzMessageService,private router:Router) {}

    ngOnInit(): void {
        /*---------------------------
        Form -- Send Notification
        -----------------------------*/
        this.validateForm = this.fb.group({
            couponCode:[null,[Validators.required]],
            couponName: [null, [Validators.required]],
            description: [null, [Validators.required]],
            percentage: [null, [Validators.required,Validators.max(100)]],
            validitydays: [null, [Validators.required]],
        });
    }
}
