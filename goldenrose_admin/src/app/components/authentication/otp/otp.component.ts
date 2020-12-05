import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
    selector: 'app-otp',
    templateUrl: './otp.component.html',
    styleUrls: ['./otp.component.less'],
})
export class OtpComponent implements OnInit {
    // Current Year
    currentYear: number = new Date().getFullYear();

    validateForm: FormGroup;
	// OTP -- /
	otp: string;
	showOtpComponent = true;
	siteName = 'Our Site';
	copyright = 'copyright';


	constructor(private auth: AuthService, private message: NzMessageService, private router: Router) {
	}

	ngOnInit(): void {
		if (localStorage.getItem('siteSetting')) {
			let jsonData = JSON.parse(localStorage.getItem('siteSetting'));
			this.siteName = jsonData.site_name;
			this.copyright = jsonData.copy_rights;
		}
	}

	@ViewChild("ngOtpInput", { static: false }) ngOtpInput: any;
	config = {
		allowNumbersOnly: false,
		length: 6,
		isPasswordInput: false,
		disableAutoFocus: false,
		placeholder: "",
		inputStyles: {
			width: "50px",
			height: "50px"
		}
	};

	onOtpChange(otp) {
		this.otp = otp;
		if (this.otp.length == 6) {
			let val = {
				email: localStorage.getItem('userEmail'),
				otp: this.otp
			}
			this.auth.VerifyG2F(val).subscribe(res => {
				if (res['success']) {
					this.SetData(res);
				
				}
			})
		}
	}

	setVal(val) {
		this.ngOtpInput.setValue(val);
	}

	onConfigChange() {
		this.showOtpComponent = false;
		this.otp = null;
		setTimeout(() => {
			this.showOtpComponent = true;
		}, 0);
	}

	public SetData(data) {
		localStorage.setItem("isLoggedIn", "active");
		localStorage.setItem("userId", data["admin"]["_id"]);
		localStorage.setItem("auth_token", data["data"]);
		localStorage.setItem("userName", data["admin"]["user_name"]);
		localStorage.setItem("userEmail", data["admin"]["email"]);
		localStorage.setItem("g2fStatus", data["admin"]["tfa_active"]);
		localStorage.setItem("login", data["login"]);
		localStorage.setItem("ip", data["ip"]);
		// this.loading = false;
		this.router.navigate(["/dashboard"]);
		this.message.success(data["message"]);
	}

    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
    }

   
}
