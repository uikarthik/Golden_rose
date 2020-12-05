import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";
import { CategoryService } from 'src/app/services/category.service'
import { SubtypeService } from 'src/app/services/subtype.service';
import { Constants } from 'src/app/shared/constants/constants';

@Component({
    selector: 'app-category-edit',
    templateUrl: './category-edit.component.html',
    styleUrls: ['./category-edit.component.less'],
})
export class CategoryEditComponent implements OnInit {
    validateForm!: FormGroup;
    categoryname;
    url = Constants.baseUrl;
    listOfControl: Array<{ id: number; controlInstance: string; value: string }> = [];
    imagearr = [];
    type = [];
    Imgurl;
    editLoading = false;
    SubtypeList= [];
    subType;
    headerurl = null;
  headerList = [];
  selectedIndx = 0;

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
            this.formdata.append('name', this.validateForm.value.categoryName);
            this.type.forEach(element => {
                this.formdata.append('type', element);

            });
            this.subType.forEach(element => {
                this.formdata.append('sub_type', element);
      
              });
            if (this.fileList1.length > 0) {
                this.formdata.append('file', this.fileList1[0]);
            }
            for (let headerfile of this.headerList) {
                this.formdata.append('header_image', headerfile);
             }
            this.category.updateCategory(this.formdata).subscribe(res => {
                if (res['success']) {
                    this.editLoading = false;
                    this.message.success(res['message'])
                    this.validateForm.reset();
                    this.router.navigate(['/category/list']);
                }
                else {
                    this.editLoading = false;
                    this.message.error(res['message'])
                }
            })
        }
    }

    // Upload -- Category Image

    fileList1 = [];

    categoryId;
    constructor(private fb: FormBuilder, private message: NzMessageService,
        private activatedRoute: ActivatedRoute, private category: CategoryService, 
        private router: Router,private subtype:SubtypeService) { }

    ngOnInit(): void {
        this.categoryId = this.activatedRoute.snapshot.paramMap.get("id");
        this.GetAllCategory(this.categoryId);
        this.validateForm = this.fb.group({
            categoryName: [null, [Validators.required, Validators.minLength(3),
                ]],
            type: [null, [Validators.required]],
            SubName:[null,[Validators.required]]
        });
        // this.addField();
        this. getSubType();
       
    }
    public async GetAllCategory(userId) {
        this.category.GetCategory().subscribe(res => {
            for (let el of res.data) {
                if (el._id == userId) {
                    this.categoryname = el.name;
                     this.type = el.type;
                    this.Imgurl = this.url + el.file[0].path;
                    this.subType = el.sub_type;
                    this.headerurl = this.url + el.header_image[0].path;
                }
            }
        });
    }

    getSubType(){
        this.subtype.GetAllSubType().subscribe(res => {
          if (res['success']) {
              let arr = res['data']
              arr.forEach(element => {
                if(element.status){
                    this.SubtypeList.push(element)
                }  
              });
          }
        })
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
}
