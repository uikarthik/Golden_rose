import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzSelectSizeType } from 'ng-zorro-antd/select';
import { NotificationsService } from 'src/app/services/notifications.service'
import { NzMessageService } from "ng-zorro-antd/message";
import { UserService } from '../../../../services/user.service';

@Component({
    selector: 'app-notification-add',
    templateUrl: './notification-add.component.html',
    styleUrls: ['./notification-add.component.less'],
})
export class NotificationAddComponent implements OnInit {
    /*---------------------------
  Select -- Select Value 
  -----------------------------*/
    selectedUser = null;
    selectedMail = null;
    editLoading=false;
    constructor(private fb: FormBuilder, private notification: NotificationsService, private message: NzMessageService, private user: UserService) { }

    ngOnInit(): void {
        this.GetAllUser();
        /*---------------------------
        Form -- Send Notification
        -----------------------------*/
        this.validateForm = this.fb.group({
            title: [null, [Validators.required]],
            message: [null, [Validators.required]],
            selectUser: [null, [Validators.required]],
            customUser: [null],
            notificationType: [null, [Validators.required]],
        });

        /*---------------------------
        Select -- Custom Select
        -----------------------------*/

    }
    /*---------------------------
    Form -- Send Notification
    -----------------------------*/
    validateForm!: FormGroup;

    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
        if (this.validateForm.valid && this.validateForm.touched) {
            if(this.tagValue.length < 0){
                this.message.error('Select User')
            }
            else{
                this.editLoading = true;
            let val = {
                title: this.validateForm.value.title,
                message: this.validateForm.value.message,
                user_type: this.validateForm.value.selectUser,
                type: this.selectedMail,
                user_list: this.tagValue,
            }
             this.notification.SendNotification(val).subscribe(res => {
                if (res['success']) {
                    this.editLoading = false;
                    this.message.success(res["message"]);
                    this.validateForm.reset();
                } else {
                    this.editLoading = false;
                    this.message.error(res["message"]);
                }
            });
        }
    }
    }

    /*---------------------------
    Select -- Custom Select
    -----------------------------*/
    listOfOption: Array<{ label: string; value: string; email: string }> = [];
    tagValue = [];
    GetAllUser() {
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

}
