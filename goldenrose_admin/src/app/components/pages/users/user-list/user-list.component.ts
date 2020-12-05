import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { Subscription, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import * as XLSX from 'xlsx';
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.less'],
})
export class UserListComponent implements OnInit {
	//UserExport
	// userTable: Array<{ username: any; nickname: any; Date:any; DOB:any; Gender:any; location:any;
	// 	email:any; mobile:any; EmailVerified:any; UserStatus:any }> = [];
	userTable: Array<{
		username: any; nickname: any; Date: any;
		email: any; mobile: any; EmailVerified: any; UserStatus: any
	}> = [];
	UserExport() {
		this.listOfData.forEach(element => {
			this.userTable.push({
				username: element.user_name,
				nickname: element.nick_name,
				Date: element.createdAt,
				email: element.email,
				mobile: element.mobile,
				EmailVerified: element.verified,
				UserStatus: element.status
			})
		});
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.userTable);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
		XLSX.writeFile(wb, 'UserTable.xlsx');

	}


	searchValue = '';
	listOfData = [];
	usersList = [];
	// premiumUserList = [];
	searchList = [];
	// modeText = "ALL";
	searchTextChanged = new Subject<string>();
	// modeValue = false;
	constructor(private user: UserService, private message: NzMessageService,) { }

	ngOnInit(): void {
		this.user.GetallUser().subscribe(res => {
			if (res['success']) {
				this.usersList = res['data'];
				this.searchList = this.usersList;

				this.listOfData = [...this.searchList];

				this.searchTextChanged.pipe(debounceTime(300)).subscribe((val) => {
					if (val == "") {
						this.listOfData = [...this.searchList];
					} else {
						this.listOfData = this.searchList.filter((item) => {
							if (item.user_name) {
								if (item.user_name.toLowerCase().includes(val.toLowerCase()))
									return item.user_name.toLowerCase().includes(val.toLowerCase());
							}
							if (item.email) {
								if (item.email.toLowerCase().includes(val.toLowerCase()))
									return item.email.toLowerCase().includes(val.toLowerCase());
							}
						}
						);
					}
				})
			}
		})
	}

	Search() {
		this.searchTextChanged.next(this.searchValue);
	}

	deleteUser(val){
		let value = {
			id:val
		}
		this.user.DeleteUserById(value).subscribe((res)=>{
			if(res['success']){
				this.message.success(res['message']);
				this.ngOnInit();
			}
			else{
				this.message.error(res['message'])
			}
		},(err)=>{
			this.message.error(err['error'])
		})
	}
}
