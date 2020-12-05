import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { NzMessageService } from "ng-zorro-antd/message";
import { Router } from '@angular/router';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.less']
})
export class ImportComponent implements OnInit {
fileList = [];
formdata:any = new FormData();

myFileName = 'Sample.xlsx';
fileUrl = '../../../assets/doc/sample.xlsx';

updateFileName = 'Sample update.xlsx';
updatefileUrl = '../../../assets/doc/updateproduct.xlsx';

  constructor(private product:ProductService, private message:NzMessageService, private router:Router) { }

  ngOnInit(): void {
  }

  readResume(fileEvent: any) {
    this.fileList = [];
    this.fileList = fileEvent.target.files[0];
  }

  updateProduct(fileEvent: any) {
    this.fileList = [];
    this.fileList = fileEvent.target.files[0];
  }

  submitForm(){
    if(this.fileList.length == 0){
      this.message.error('Upload File')
    }
    else{
      this.formdata.append('file',this.fileList)
      this.product.ImportFile(this.formdata).subscribe((res)=>{
        if(res['success']){
          this.message.success(res['message'])
          this.router.navigate(['/product/list'])
        }
        else{
          this.message.error(res['message'])
        }
      })
    }
   
  }

  updateForm(){
    if(this.fileList.length == 0){
      this.message.error('Upload File')
    }
    else{
      let updateFormData:any = new FormData();
      updateFormData.append('file',this.fileList)
      this.product.UpdateFile(updateFormData).subscribe((res)=>{
        if(res['success']){
          this.message.success(res['message'])
          this.router.navigate(['/product/list'])
        }
        else{
          this.message.error(res['message'])
        }
      })
    }

  }
}
