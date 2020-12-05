import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['./forgot.component.less'],
})
export class ForgotComponent implements OnInit {
    // Current Year
    currentYear: number = new Date().getFullYear();

    validateForm: FormGroup;
    siteName = 'Our Site';
	copyright = 'copyright';


    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
        if(this.validateForm.valid){
            this.ForgotPassword();
        }
       
    }

    constructor(private fb: FormBuilder, 
         private message: NzMessageService,
         private auth: AuthService) { 
		if (localStorage.getItem('siteSetting')) {
			let jsonData = JSON.parse(localStorage.getItem('siteSetting'));
			this.siteName = jsonData.site_name;
			this.copyright = jsonData.copy_rights;
		}
	}
    ngOnInit(): void {
        this.validateForm = this.fb.group({
            email: [null, [Validators.required]],
        });
    }
    
	ForgotPassword(): void {
		for (const i in this.validateForm.controls) {
			this.validateForm.controls[i].markAsDirty();
			this.validateForm.controls[i].updateValueAndValidity();
		}
		if (this.validateForm.status == "VALID" && this.validateForm.touched) {
			this.auth.ForgotPassword({ email: this.validateForm.value.email }).subscribe(res => {
				if (res['success']) {
					this.message.success(res["message"]);
				} else {
					 this.message.error(res["message"]);
				}
			})
		}
	}
}
