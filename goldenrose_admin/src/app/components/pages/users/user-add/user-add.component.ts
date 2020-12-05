import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
    selector: 'app-user-add',
    templateUrl: './user-add.component.html',
    styleUrls: ['./user-add.component.less'],
})
export class UserAddComponent implements OnInit {
    passwordVisible = false;
	password: string;
	// Forms -- select
	selectedValue = null;
	typeValue = null;
	// Forms -- textarea
	inputValue: string;
	// Forms -- input 
	validateForm: FormGroup;
	isEdit: boolean = false;
	editId;
	editLoading = false;
	userName;
	userEmail;
    userMobile;
    gender;
   
	// userRefferral;

	constructor(
		private fb: FormBuilder,
		private user: UserService,
		private router: Router,
		private message: NzMessageService,
		private activatedRoute: ActivatedRoute) { }

	ngOnInit(): void {
        let userId = this.activatedRoute.snapshot.paramMap.get("id");
       	
		if (userId) {
            this.isEdit = true;
           this.GetUserById(userId);
			this.validateForm = this.fb.group({
				username: [null,   [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(20),
                ]],				
                mobile: [null, [Validators.required, Validators.pattern('([0-9]{8,12})')]],
                email: [null, [Validators.email, Validators.required]],
                gender:[Validators.required]				
			});
		} else{
			this.validateForm = this.fb.group({
				username: [null,   [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(20),
                ]],				
                mobile: [null, [Validators.required, Validators.pattern('([0-9]{8,12})')]],
                email: [null, [Validators.email, Validators.required]],
              	password: [null, [Validators.required, this.patternValidate, Validators.pattern(
					/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\/])(?=.{8,})/
				)]],
                confirmpassword: [null, [Validators.required, this.confirmationValidator]],
                gender:[Validators.required]
				// refToken: [null]
			});
		}
	
	}

	public GetUserById(userId) {
		this.editId = userId;
		this.user.GetallUser().subscribe(res => {
			for (let el of res.data) {
				if (el._id == userId) {
					this.userName = el.user_name;					
                    this.userMobile = el.mobile;
                    this.userEmail = el.email;
                    this.gender = el.gender;
                   // this.userRefferral = el.referral_token;
				}
			}
		})

	}

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

	submitForm(): void {
		for (const i in this.validateForm.controls) {
			this.validateForm.controls[i].markAsDirty();
			this.validateForm.controls[i].updateValueAndValidity();
		}
		if (this.validateForm.status == "VALID" && this.validateForm.touched) {
			this.editLoading = true;
			if (this.isEdit) {
                this.UpdateUser();  
			} else {
                this.CreateUser();
			}
		}
	}

	public CreateUser() {
		if (this.validateForm.value.password === this.validateForm.value.confirmpassword) {
			this.editLoading  = true;
			let val = {
				email: this.validateForm.value.email,
				user_name: this.validateForm.value.username,
				mobile: this.validateForm.value.mobile,
                password: this.validateForm.value.password,
                gender:this.validateForm.value.gender
				// ref_token: this.validateForm.value.refToken
			}
			this.user.CreateUser(val).subscribe(res => {
				if (res['success']) {
					this.editLoading = false;
					this.router.navigate(['/user/list']);
					this.message.success(res['message']);
				} else {
					this.message.error(res['message']);
					this.editLoading = false;
					
				}
			});
		}
	}

	public UpdateUser() {
		let val = {
            id: this.editId,
            user_name:this.validateForm.value.username,			
			email: this.validateForm.value.email,
            mobile: this.validateForm.value.mobile,
            gender:this.gender		
		}
		this.user.UpdateUser(val).subscribe(res => {
			if (res['success']) {
				this.editLoading = false;
                this.router.navigate(['/user/list']);
				this.message.success(res['message']);
			} else {
				this.message.error(res['message']);
				this.editLoading = false;
               
			}
		});
	}
}
