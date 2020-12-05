import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CouponService } from '../../../../services/coupon.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { Subscription, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.less'],
})
export class CouponListComponent implements OnInit {
  searchTextChanged = new Subject<string>();
  searchValue = '';
  resultlist = [];

  /*-------------------------------
  Table -- for Recent Orders
  -------------------------------*/
  listOfData = [];

  /*---------------------------
  Form -- for Send Coupon
  -----------------------------*/
  sendCouponForm!: FormGroup;
  editLoading = false;
  sendCouponSubmit(): void {
    for (const i in this.sendCouponForm.controls) {
      this.sendCouponForm.controls[i].markAsDirty();
      this.sendCouponForm.controls[i].updateValueAndValidity();
    }
    if (this.sendCouponForm.valid && this.sendCouponForm.touched) {
      if(this.tagValue.length < 0){
        this.message.error('Select User')
      }
      else{
        this.editLoading = true;
      let val = {
        title: this.couponSelected.title,
        message: this.couponSelected.description,
        user_type: this.sendCouponForm.value.selectUser,
        type: this.sendCouponForm.value.notificationType,
        user_list: this.tagValue,
        coupon: this.couponSelected._id
      }
    
      this.notification.SendNotification(val).subscribe(res => {
        if (res['success']) {
          this.isSendCoupon = false;
          this.editLoading=false;
          this.message.success(res["message"]);
          this.sendCouponForm.reset();
        } else {
          this.editLoading = false;
          this.message.error(res["message"]);
        }
      });
    }
  }
  }

  

  /*---------------------------
  Form -- for Edit Coupon
  -----------------------------*/
  editCouponForm!: FormGroup;

  editCouponSubmit(): void {
    for (const i in this.editCouponForm.controls) {
      this.editCouponForm.controls[i].markAsDirty();
      this.editCouponForm.controls[i].updateValueAndValidity();
    }
    if(this.editCouponForm.valid){
      this.editLoading = true;
      this.EditCoupon();
    }
  }

  /*-------------------------------
  Modal -- for Send Coupon
  -------------------------------*/
  isSendCoupon = false;
  couponSelected;
  sendCoupon(data): void {
    this.isSendCoupon = true;
    this.couponSelected = data;
  }

  /*-------------------------------
  Modal -- for Edit Coupon
  -------------------------------*/
  iseditCoupon = false;
  couponTitle;
  couponCode;
  couponPercentage;
  couponValidity;
  couponDescription;
  expirydate;
  editId;
  dateFormat = 'yyyy/MM/dd';

  editCoupon(data): void {
    this.iseditCoupon = true;
    this.editId = data._id;
    this.couponTitle = data.title;
    this.couponCode = data.couponcode;
    this.couponPercentage = data.percentage;
    this.couponValidity = data.validitydays;
    this.couponDescription = data.description;
  }

  public EditCoupon() {
    let val = {
      id: this.editId,
      title: this.editCouponForm.value.couponName,
      couponcode: this.editCouponForm.value.couponCode,
      validitydays: this.editCouponForm.value.validitydays,
      percentage: this.editCouponForm.value.percentage,
      description: this.editCouponForm.value.description,

    }
    // console.log(val,'edit coupon')
    this.couponService.CouponUpdate(val).subscribe(res => {
      if (res['success']) {
        this.editLoading = false;
         this.iseditCoupon = false;
        this.message.success(res["message"]);
        this.GetAllCoupon();
      }
    });
  }
 
  /*---------------------------
  Select -- for Send Coupon 
  -----------------------------*/
  listOfOption: Array<{ label: string; value: string;email:string }> = [];
  tagValue = [];
  selectedUser = null;
  selectedMail = null;

  GetAllUser(){
    this.user.GetallUser().subscribe(res => {
			if (res['success']) {
         const children: Array<{ label: string; value: string; email: string }> = [];
        for (let i = 0; i < res['data'].length; i++) {
          children.push({ label: res['data'][i].email, value: res['data'][i]._id, email: res['data'][i].email });
        }
        this.listOfOption = children;
      }
    });
  }

  /*-------------------------------
  Modal -- for Delete Coupon
  -------------------------------*/
  confirmModal?: NzModalRef;
  deleteCoupon(id): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: 'Do you want to delete this coupon?',
      nzContent: 'The coupon will be deleted permanently.',
      nzOnOk: () =>{
        this.Deletecoupon(id);
      }
        // new Promise((resolve, reject) => {
        //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        // }).catch(() => console.log('Oops errors!')),
    });
  }


  constructor(private modal: NzModalService, private fb: FormBuilder, private couponService: CouponService,
    private message: NzMessageService,
    private user: UserService, private notification:NotificationsService) { }

  ngOnInit(): void {
    this.GetAllCoupon();
    this.GetAllUser();
    /*---------------------------
    Form -- for Send Coupon
    -----------------------------*/
    this.sendCouponForm = this.fb.group({
      selectUser: [null, [Validators.required]],
      customUser: [null],
      notificationType: [null, [Validators.required]],
    });
    /*---------------------------
    Form -- Send Notification
    -----------------------------*/
    this.editCouponForm = this.fb.group({
      couponCode: [null, [Validators.required]],
      couponName: [null, [Validators.required]],
      description: [null, [Validators.required]],
      percentage: [null, [Validators.required]],
      validitydays: [null, [Validators.required]],

    });

    /*---------------------------
    Select -- for Send Coupon
    -----------------------------*/
    
  }

  Deletecoupon(id): void {
    this.couponService.DeleteCoupon(id).subscribe(res => {
      if (res['success']) {
        this.message.success(res['message']);
        this.GetAllCoupon();
      } else {
        this.message.error(res['message']);
      }
    })
  }

  public GetAllCoupon() {
    this.couponService.CouponList().subscribe(res => {
      if (res['success']) {
        this.resultlist = res['data'];
        this.listOfData = [...this.resultlist];
        this.searchTextChanged.pipe(debounceTime(300)).subscribe((val) => {
          if (val == "") {
            this.listOfData = [...this.resultlist];
          } else {
            this.listOfData = this.resultlist.filter((item) => {
              if (item.couponcode) {
                if (item.couponcode.toLowerCase().includes(val.toLowerCase()))
                  return item.couponcode.toLowerCase().includes(val.toLowerCase());
              }
              if (item.title) {
                if (item.title.toLowerCase().includes(val.toLowerCase()))
                  return item.title.toLowerCase().includes(val.toLowerCase());
              }
            });
          }
        });
      }
    })
  }
  public EnableCoupon(data) {
    this.couponService.CouponStatus(data._id).subscribe(res => {
      if (res['success']) {
        data.status = data.status ? false : true;
        this.message.success(res["message"]);
      } else {
        this.message.error(res["message"]);
      }
    });
  }
  Search() {
    this.searchTextChanged.next(this.searchValue);
  }

  max100() {
    this.couponPercentage = this.couponPercentage > 100 ? 100 : this.couponPercentage;
    this.couponPercentage = this.couponPercentage < 0 ? 0 : this.couponPercentage
  }

  maxdays(){
    this.couponValidity = this.couponValidity < 0 ? 1:this.couponValidity;
  }

}
