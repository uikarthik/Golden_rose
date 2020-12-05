import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TypeserviceService } from 'src/app/services/typeservice.service';
import { NzMessageService } from "ng-zorro-antd/message";
import { Router } from '@angular/router';
import { SubtypeService } from 'src/app/services/subtype.service';

@Component({
  selector: 'app-typeadd',
  templateUrl: './typeadd.component.html',
  styleUrls: ['./typeadd.component.less']
})
export class TypeaddComponent implements OnInit {

  validateForm!: FormGroup;
  listOfControl: Array<{ id: number; controlInstance: string }> = [];
   selectedIndx = 0;
  fileList = [];
  headerList = [];
  url = null;
  headerurl = null;
  type;
  editLoading = false;
  SubtypeList= [];

  constructor(private fb: FormBuilder, private router: Router, private types: TypeserviceService,
    private message: NzMessageService, private subtype:SubtypeService) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      categoryName: [null, [Validators.required]],
    });
    //  this.addField();
    
  }

  
  public formdata: any = new FormData();
  onFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      this.selectedIndx = 0;
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.url = event.target.result;
      }
      this.fileList.push(e.target.files[0]);

    }
  }

  onFileChangeHeaderImg(e) {
    if (e.target.files && e.target.files[0]) {
      this.selectedIndx = 0;
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.headerurl = event.target.result;
      }
      this.headerList.push(e.target.files[0]);

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
    if (this.fileList.length == 0) {
      this.message.error('upload Image');
    }
    else {
      if (this.validateForm.status == "VALID" && this.validateForm.touched && this.validateForm.status == "VALID") {
        this.formdata = new FormData();
          
        this.editLoading = true;
       this.formdata.append('name', this.validateForm.value.categoryName.toUpperCase());
       
        for (let file of this.fileList) {
         this.formdata.append('file', file);
      }

      for (let headerfile of this.headerList) {
         this.formdata.append('header_image', headerfile);
      }
        this.types.CreateType(this.formdata).subscribe(res => {
          if (res['success']) {
            this.editLoading = false;
            this.message.success(res['message'])
            this.validateForm.reset();
            this.router.navigate(['/Typelist']);
          }
          else {
            this.editLoading = false;
            this.message.error(res['message'])
          }
        })
      }
    }
  }

 
}
