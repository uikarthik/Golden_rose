import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";


@Component({
	selector: 'app-reset',
	templateUrl: './reset.component.html',
	styleUrls: ['./reset.component.less'],
})
export class ResetComponent implements OnInit {
	// Current Year
	currentYear: number = new Date().getFullYear();

	// Form
	validateForm: FormGroup;
	siteName = 'Our Site';
	copyright = 'copyright';

	updateConfirmValidator(): void {
		/** wait for refresh value */
		Promise.resolve().then(() => this.validateForm.controls.confirmpassword.updateValueAndValidity());
	}

	confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
		if (!control.value) {
			return { required: true };
		} else if (control.value !== this.validateForm.controls.password.value) {
			return { confirm: true, error: true };
		}
		return {};
	};

	patternValidate = (control: FormControl): { [s: string]: boolean } => {
		let rex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
		if (!control.value) {
			return { required: true };
		} else if (rex.test(control.value) !== true) {
			return { patternValidity: true, error: true };
		}
		return {};
	};

	constructor(
		private fb: FormBuilder,
		private auth: AuthService,
		private message: NzMessageService,
		private router: Router,
		private route: ActivatedRoute) {
		localStorage.setItem('auth_token', this.route.snapshot.paramMap.get("id"));
	}

	ngOnInit(): void {
		this.validateForm = this.fb.group({
			password: [null, [Validators.required, this.patternValidate, Validators.pattern(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\/])(?=.{8,})/
			)]],
			confirmpassword: [null, [Validators.required, this.confirmationValidator]],
		});
		if (localStorage.getItem('siteSetting')) {
			let jsonData = JSON.parse(localStorage.getItem('siteSetting'));
			this.siteName = jsonData.site_name;
			this.copyright = jsonData.copy_rights;
		}
	}

	submitForm(): void {
		for (const i in this.validateForm.controls) {
			this.validateForm.controls[i].markAsDirty();
			this.validateForm.controls[i].updateValueAndValidity();
		}
		if (this.validateForm.status == "VALID" && this.validateForm.touched) {
			if (this.validateForm.value.password === this.validateForm.value.confirmpassword) {
				this.auth.ResetPassword({ password: this.validateForm.value.password }).subscribe(res => {
					if (res['success']) {
						localStorage.clear();
						sessionStorage.clear();
						this.message.success(res["message"]);
						this.router.navigate(["/auth/login"]);
					} else {
						this.message.error(res["message"]);
					}
				});
			}
			else {
				this.message.error('Password Mismatch')
			}
		}
	}
}
