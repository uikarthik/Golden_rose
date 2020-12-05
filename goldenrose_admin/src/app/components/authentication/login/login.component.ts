import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from "src/app/services/auth.service";
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SettingsService } from 'src/app/services/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { validLanguage } from 'src/app/helpers/languages';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit {
    // Current Year
    currentYear: number = new Date().getFullYear();

    // Form -- Login
    verifyEmailId: any = null;
	deviceAuth = true;
	siteName = 'Our Site';
	copyright = 'copyright';
	editLoading = false;

	// Password Visible
	passwordVisible = false;
	password: string;

	// Form
	validateForm: FormGroup;
	language:any;

	submitForm(): void {
		for (const i in this.validateForm.controls) {
			this.validateForm.controls[i].markAsDirty();
			this.validateForm.controls[i].updateValueAndValidity();
		}
	}

	constructor(
		private fb: FormBuilder,
		private auth: AuthService,
	 	private message: NzMessageService,
		private router: Router,
		private notify:NzMessageService,
		private settings:SettingsService,private translate: TranslateService,
		private route: ActivatedRoute) {

	}

	ngOnInit(): void {
		if (localStorage.getItem('siteSetting')) {
			let jsonData = JSON.parse(localStorage.getItem('siteSetting'));
			this.siteName = jsonData.site_name;
			this.copyright = jsonData.copy_rights;
		}
		this.verifyEmailId = this.route.snapshot.paramMap.get("id");
		this.FormValidation();
		if (this.auth.isLoggednIn()) {
			this.router.navigate(["/"]);
			return;
		}
		this.GetAdminProfile();
        setTimeout(() => {
            if(this.language == "spanish"){
                localStorage.setItem('locale','es');
                console.log(localStorage.getItem('locale'))
                this.translate.use(validLanguage(localStorage.getItem('locale')));
                document.documentElement.lang = localStorage.getItem('locale');
            }
            else{
                localStorage.setItem('locale','en');
                console.log(localStorage.getItem('locale'))
                this.translate.use(validLanguage(localStorage.getItem('locale')));
                document.documentElement.lang = localStorage.getItem('locale');
            }
        }, 1000);
       
	}

	FormValidation() {
		this.validateForm = this.fb.group({
			email: [null, [Validators.required]],
			password: [null, [Validators.required]],
			remember: [false],
			// otp: [null, [Validators.minLength(6), Validators.maxLength(6), Validators.pattern('([0-9]{6,6})')]]
		});
	}

	public GetAdminProfile() {
        this.settings.GetSetting().subscribe(res => {
            if (res['success']) {
                this.language = res['data']['language'];
                console.log(this.language)
            }
        });
    }
	// verifyMail(id) {
	// 	this.auth.VerifyEmail().subscribe(data => {
	// 		if (data["success"]) {
	// 			// this.message.success(data["message"]);
	// 		} else {
	// 			// this.message.error(data["message"]);
	// 		}
	// 	});
	// }

	login() {
		for (const i in this.validateForm.controls) {
			this.validateForm.controls[i].markAsDirty();
			this.validateForm.controls[i].updateValueAndValidity();
		}
		if (this.validateForm.status == "VALID" && this.validateForm.touched) {
			const loginParams: any = {
				email: this.validateForm.value.email,
				password: this.validateForm.value.password,
				// otp: this.validateForm.value.otp
			};
			this.auth.login(loginParams).subscribe((data: any) => {
				if (data["success"]) {
					this.editLoading=true;
					if (data["success"] && data["g2fa"]) {
						localStorage.setItem('userEmail', this.validateForm.value.email);
						this.router.navigate(['/auth/otp']);
					}
					else if (data['result'] && data['result']['emailAuth']) {
						// this.success = 1;
						this.deviceAuth = true;
						const dataId = data['result']['id'];
					} else {
						this.SetData(data);
					}
				} else {
					this.editLoading = false;
					// this.loading = false;
					 this.notify.error(data["message"]);
					// this.notify.error(data['message'])
				}
			});
		}


	}

	SetData(data) {
		this.deviceAuth = false;
		this.validateForm.value.remember
			? localStorage.setItem("remember", "true")
			: localStorage.setItem("remember", "false");
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
		this.notify.success(data["message"]);

	}
}
