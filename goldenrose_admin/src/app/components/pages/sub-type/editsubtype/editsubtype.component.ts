import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";
import { SubtypeService } from 'src/app/services/subtype.service'

@Component({
  selector: 'app-editsubtype',
  templateUrl: './editsubtype.component.html',
  styleUrls: ['./editsubtype.component.less']
})
export class EditsubtypeComponent implements OnInit {
  validateForm!: FormGroup;
  editLoading = false;
  categoryname: any;

  // Upload -- Category Image

  fileList1 = [];

  categoryId;
  constructor(private fb: FormBuilder, private message: NzMessageService,
    private activatedRoute: ActivatedRoute, private subtype: SubtypeService, private router: Router,) { }

  ngOnInit(): void {
    this.categoryId = this.activatedRoute.snapshot.paramMap.get("id");
    this.GetAllCategory(this.categoryId);
    this.validateForm = this.fb.group({
      categoryName: [null, [Validators.required]],
    });
    // this.addField();
  }
  public GetAllCategory(userId) {
    this.subtype.GetAllSubType().subscribe(res => {
      for (let el of res.data) {
        if (el._id == userId) {
          this.categoryname = el.name;

        }
      }
    });
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

    if (this.validateForm.status == "VALID") {
      this.editLoading = true;

      let val = {
        id: this.categoryId,
        name: this.validateForm.value.categoryName.toUpperCase()
      }
      this.subtype.updateSubType(val).subscribe(res => {
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
