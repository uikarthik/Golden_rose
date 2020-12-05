import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SubtypeService } from 'src/app/services/subtype.service';
import { NzMessageService } from "ng-zorro-antd/message";
import { Router } from '@angular/router';

@Component({
  selector: 'app-sub-typeadd',
  templateUrl: './sub-typeadd.component.html',
  styleUrls: ['./sub-typeadd.component.less']
})
export class SubTypeaddComponent implements OnInit {

  validateForm!: FormGroup;
  editLoading = false;
  constructor(private fb: FormBuilder, private router: Router, private subtype: SubtypeService,
    private message: NzMessageService,) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      categoryName: [null, [Validators.required, Validators.minLength(3),
      Validators.maxLength(20)]],
    });
    //  this.addField();
  }

 
  
  public async submitForm() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    for (const j in this.validateForm.controls) {
      this.validateForm.controls[j].markAsDirty();
      this.validateForm.controls[j].updateValueAndValidity();
    }
      if (this.validateForm.status == "VALID" && this.validateForm.touched && this.validateForm.status == "VALID") {
        this.editLoading = true;

        let val ={
          name:this.validateForm.value.categoryName.toUpperCase()
        }
        this.subtype.CreateSubType(val).subscribe(res => {
          if (res['success']) {
            this.editLoading = false;
            this.message.success(res['message'])
            this.validateForm.reset();
            this.router.navigate(['/subtypeList']);
          }
          else {
            this.editLoading = false;
            this.message.error(res['message'])
          }
        })
      }
    }

}
