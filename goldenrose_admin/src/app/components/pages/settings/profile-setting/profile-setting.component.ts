import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from 'src/app/services/settings.service'
import { AuthService } from '../../../../services/auth.service';
import { NzMessageService } from "ng-zorro-antd/message";
import { FormControl } from "@angular/forms";

@Component({
    selector: 'app-profile-setting',
    templateUrl: './profile-setting.component.html',
    styleUrls: ['./profile-setting.component.less'],
})
export class ProfileSettingComponent implements OnInit {

    isVisibleOne = false;
    // Form -- Change Password
    validateForm!: FormGroup;

    // Form -- Change Password
    passwordVisibleOld = false;
    passwordVisibleNew = false;
    passwordVisibleConfirm = false;
    passwordOld?: string;
    passwordNew?: string;
    passwordConfirm?: string;

    // Modal -- Enable 2FA
    isVisible = false;

    handleOk(): void {
        this.isVisible = false;
    }

    handleCancel(): void {
        this.isVisible = false;
    }
    // Modal -- Disable 2FA

    isDisableAuth = false;
    twoFactorDisable(): void {
        this.isDisableAuth = true;
    }

    handelDisableAuth(): void {
        this.isDisableAuth = false;
    }

    constructor(private fb: FormBuilder, private settings: SettingsService, private message: NzMessageService,
        private authService: AuthService) { }
    adminactivity = [];
    adminDetais: any = {
        user_name: '',
        email: '',
        tfa_active: false,
        _id: ''
    };
    g2fSecretKey;
    g2fQrCode;
    // activityDetails;
    otp;
    lastLogin = '';
    lastIp = '';
    editLoading = false;
    ngOnInit(): void {
        this.adminActivity();
        this.GetAdminProfile();

        this.validateForm = this.fb.group({
            oldpassword: [null, [Validators.required]],
			newpassword: [null, [Validators.required, this.patternValidate]],
			confirmpassword: [null, [Validators.required, this.confirmationValidator]],
        });
    }
    OldNewPasswordValid = (control: FormControl): { [s: string]: boolean } => {
		if (!control.value) {
			return { required: true };
		} else if (control.value === this.validateForm.controls.oldpassword.value) {
			return { errorValidity: true, error: true };
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

	confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
		if (!control.value) {
			return { required: true };
		} else if (control.value !== this.validateForm.controls.confirmpassword.value) {
			return { confirm: true, error: true };
		}
		return {};
	};
    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
        if (this.validateForm.value.newpassword !== '' && this.validateForm.value.oldpassword !== '') {
			if (this.validateForm.value.newpassword === this.validateForm.value.confirmpassword) {
                this.editLoading = true;
				let val = {
					old_password: this.validateForm.value.oldpassword,
					password: this.validateForm.value.newpassword
				}
				this.authService.ChangePassword(val).subscribe(res => {
					if (res['success']) {
                        this.editLoading = false;
						this.message.success(res["message"]);
					} else {
                        this.editLoading = false;
						this.message.error(res["message"]);
					}
				});
			}
		}
    }
    public GetAdminProfile() {
        this.authService.Getprofile().subscribe(res => {
            if (res['success']) {
                this.adminDetais = res['data'];
            }
        });
    }
    adminActivity() {
        this.settings.AdminActivity().subscribe(res => {
            if (res['success']) {
                this.adminactivity = res['data'];
                this.lastLogin = this.adminactivity.length > 0 ? this.adminactivity[0].createdAt : '';
                this.lastIp = this.adminactivity.length > 0 ? this.adminactivity[0].ip : '';
            }
        });
    }
    twoFactorEnable(): void {
        this.authService.GetG2F().subscribe(res => {
            this.isVisible = true;
            this.g2fSecretKey = res["data"]["secret"];
            this.g2fQrCode = res["data"]["img"];
        })
    }
    public EnableG2F() {
        this.authService.EnableG2F({ otp: this.otp }).subscribe(res => {
            if (res['success']) {
                this.isVisible = false;
                this.isVisibleOne = false;
                this.message.success(res["message"]);
                this.adminDetais.tfa_active = true;
            } else {
                this.message.error(res["message"]);
            }
        })
    }

    public DisableG2F() {
        this.authService.DisableG2F({ otp: this.otp }).subscribe(res => {
            if (res['success']) {
                this.isVisibleOne = false;
                this.isDisableAuth = false;
                this.message.success(res["message"]);
                this.adminDetais.tfa_active = false;
            } else {
                this.message.error(res["message"]);
            }
        })
    }

    onOtpChange(otp, action) {
        this.otp = otp;
        if (this.otp.length == 6) {
            if (action == 1) {
                this.EnableG2F();
            } else {
                this.DisableG2F();
            }
        }
    }
}
