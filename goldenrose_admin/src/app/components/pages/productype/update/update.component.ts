import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";
import { TypeserviceService } from 'src/app/services/typeservice.service';
import { Constants } from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.less']
})
export class UpdateComponent implements OnInit {
  validateForm!: FormGroup;
  categoryname;
  url = Constants.baseUrl;
  imagearr = [];
  type = [];
  fileList1 = [];
  HeaderfileList = [];

  Imgurl;
  HeaderImgurl;
  editLoading = false;

  public formdata: any = new FormData();
  onFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.Imgurl = event.target.result;
      }
      this.fileList1.push(e.target.files[0]);
    }
  }

  onFileChangeHeaderImg(e) {
    if (e.target.files && e.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.HeaderImgurl = event.target.result;
      }
      this.HeaderfileList.push(e.target.files[0]);
    }
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
      this.formdata = new FormData();
          
      this.editLoading = true;
      let arr = []

      this.formdata.append('id', this.categoryId)
      this.formdata.append('name', this.validateForm.value.categoryName.toUpperCase());
      if (this.fileList1.length > 0) {
        this.formdata.append('file', this.fileList1[0]);
      }
      if (this.HeaderfileList.length > 0) {
        this.formdata.append('header_image', this.HeaderfileList[0]);
      }

      this.types.updateType(this.formdata).subscribe(res => {
         if (res['success']) {
          this.editLoading = false;
          this.message.success(res['message'])
          this.validateForm.reset();
          this.getAllType();
          this.router.navigate(['/Typelist']);
        }
        else {
          this.editLoading = false;
          this.message.error(res['message'])
        }
      })
    }
  }

  // Upload -- Category Image


  categoryId;
  constructor(private fb: FormBuilder, private message: NzMessageService,
    private activatedRoute: ActivatedRoute, private types: TypeserviceService, private router: Router,) { }

  ngOnInit(): void {
    this.categoryId = this.activatedRoute.snapshot.paramMap.get("id");
    this.GetAllCategory(this.categoryId);
    this.validateForm = this.fb.group({
      categoryName: [null, [Validators.required]],
    });
    // this.addField();
  }
  public GetAllCategory(userId) {
    this.types.GetAllType().subscribe(res => {
      for (let el of res.data) {
        if (el._id == userId) {
          this.categoryname = el.name;
          this.type = el.type;
          this.Imgurl = this.url + el.file[0].path;
          this.HeaderImgurl = this.url + el.header_image[0].path;

        }
      }
    });
  }

  getAllType() {
    this.types.GetAllType().subscribe(res => {
      if (res['success']) {
      }
    })
  }

}
