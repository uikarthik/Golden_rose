import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { CategoryService } from 'src/app/services/category.service'
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProductService } from 'src/app/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SubtypeService } from 'src/app/services/subtype.service';
import { Constants } from 'src/app/shared/constants/constants';

@Component({
    selector: 'app-product-edit',
    templateUrl: './product-edit.component.html',
    styleUrls: ['./product-edit.component.less'],
})
export class ProductEditComponent implements OnInit {
    listOfControl: Array<{ id: number; controlInstance: string; value: number }> = [];
    qtyOfControl: Array<{ id: number; controlInstance: string; value: number }> = [];
    weightOfControl: Array<{ id: number; controlInstance: string; value: number }> = [];

    validateArrayForm: FormGroup;
    
    weight;
    ImageArray:Array<{File:any}>=[];
    categoryList = [];
    SubtypeList = [];
    htmlContent = '';
    config: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: '15rem',
        minHeight: '5rem',
        placeholder: 'Enter text here...',
        translate: 'no',
        defaultParagraphSeparator: 'p',
        defaultFontName: 'Arial',
        toolbarHiddenButtons: [['bold']],
        customClasses: [
            {
                name: 'quote',
                class: 'quote',
            },
            {
                name: 'redText',
                class: 'redText',
            },
            {
                name: 'titleText',
                class: 'titleText',
                tag: 'h1',
            },
        ],
    };
    // Form -- Add Form
    Step1validateForm!: FormGroup;
    Step2validateForm!: FormGroup;
    formdata: any;
    size_available = [];
    // Select
    stockValue;
    selectedGender;
    Category;
    product_price;
    available = 0;
    tagtype = [];
    subtagtype;
    sizeOfControl: Array<{ id: number; controlInstance: string; value: number }> = [];

    // Step -- Add Form
    step = 0;
    pre(): void {
        this.step -= 1;
    }

    next(): void {
        // if (this.fileList.length == 0 && this.imageList.length == 0) {
        //     this.messge.error('Upload Image')
        // }
        // else {
            this.step += 1;
        // }
      
    }

    done(): void {

    }

    constructor(private fb: FormBuilder, private subtype: SubtypeService, private router: Router, private category: CategoryService, private activateroute: ActivatedRoute, private product: ProductService, private messge: NzMessageService) { }
    fileList = [];
    previewImage: string | undefined = '';
    previewVisible = false;
    editLoading = false;
    arr = [];
    productid;
    name;
    product_id;
    price = [];
    percentage;
    gender;
    type;
    stype;
    imageList = [];
    quantity;
    size = [];
    url = Constants.baseUrl;

    handlePreview = (file: NzUploadFile) => {
        this.previewImage = file.url || file.thumbUrl;
        this.previewVisible = true;
    };

    ngOnInit(): void {
        this.getCategory();

        this.productid = this.activateroute.snapshot.paramMap.get("id");
        // Form -- Add Form
        this.Step1validateForm = this.fb.group({
            productName: [null,[Validators.required]],
            productID: [null],
            categoryname: [null],

        });

        this.Step2validateForm = this.fb.group({
            price: [null,[Validators.min(1)]],
            productprice: [null],
            discount: [null, [Validators.min(0),Validators.max(100)]],
            stock: [null],
            // gender: [null],
            type: [null],
            weight: [null],
            Quantity:[null],
            sizeValue: [null],
            sub_type: [null],
            longDescription: [null],
        });
        this.getAllProduct(this.productid);
        this.getSubType();
    }
    priceValidate() {
        if (this.product_price == 'FIXED') {
            this.Step2validateForm = this.fb.group({
                productprice: [this.product_price],
                discount: [this.percentage, [Validators.min(0),Validators.max(100)]],
                stock: [this.stockValue],
                // gender: [this.selectedGender],
                type: [this.tagtype],
                longDescription: [this.htmlContent],
                sizeValue: [this.size],
                price: [this.price,,[Validators.min(1)]],
                sub_type: [this.stype],
                // weight: [this.weight, [ Validators.min(0)]],
               // Quantity:[this.quantity,[Validators.required]]
               Quantity: [this.quantity, [ Validators.min(0), Validators.pattern('^(0|\-?[1-9][0-9]*)$')]]
            });
        }
        else if (this.product_price == 'CUSTOM') {
            this.validateArrayForm = this.fb.group({});

            this.Step2validateForm = this.fb.group({
                productprice: [this.product_price],
                discount: [this.percentage, [Validators.min(0),Validators.max(100)]],
                stock: [this.stockValue],
                // gender: [this.selectedGender],
                type: [this.tagtype],
                longDescription: [this.htmlContent],
                price: [this.price,[Validators.min(1)]],
                sizeValue: [this.size],
                sub_type: [this.stype]

            });
        }
    }

    getCategory() {
        this.category.GetCategory().subscribe(res => {
            if (res['success']) {
                this.categoryList = res['data']
            }
        });
    }



    selectedIndx = 0;
    preview = [];
    onFileChange(e) {
        if (e.target.files && e.target.files[0]) {
            this.selectedIndx = 0;
            for (let i = 0; i < e.target.files.length; i++) {
                var reader = new FileReader();

                reader.onload = (event) => { // called once readAsDataURL is completed
                    this.preview.push(event.target.result);
                }

                reader.readAsDataURL(e.target.files[i]);
                this.fileList.push(e.target.files[i]);
            }
         }
    }
    RemoveFile(val) {
        this.selectedIndx =
            this.selectedIndx < this.preview.length - 1
                ? this.selectedIndx++
                : this.selectedIndx - 1;
        this.fileList.splice(val, 1);
        this.preview.splice(val, 1);
         this.ImageDelete(val)
    }

    public submitForm() {

        for (const i in this.Step2validateForm.controls) {
            this.Step2validateForm.controls[i].markAsDirty();
            this.Step2validateForm.controls[i].updateValueAndValidity();
        }

        if (this.Step2validateForm.valid) {
            this.formdata = new FormData();
            this.formdata.append('id', this.productid);
            this.formdata.append('name', this.Step1validateForm.value.productName);
            this.formdata.append('product_id', this.Step1validateForm.value.productID);
            this.formdata.append('category_id', this.Category);
            // this.formdata.append('gender', this.Step2validateForm.value.gender);
            this.formdata.append('stock_available', this.Step2validateForm.value.stock);
            this.formdata.append('offer_percentage', this.Step2validateForm.value.discount);
            this.formdata.append('price_by', this.Step2validateForm.value.productprice);
            this.formdata.append('sub_type', this.Step2validateForm.value.sub_type);
              let sizearr = [];
            let qtyarr = [];
            let weightarr = [];
            this.arr=[];

            if (this.product_price == 'FIXED') {
                this.formdata.append('price', this.Step2validateForm.value.price);
                this.formdata.append('size', this.Step2validateForm.value.sizeValue);
                this.formdata.append('stock_count', this.Step2validateForm.value.Quantity);
                // this.formdata.append('weight', this.Step2validateForm.value.weight);

            }
            else {
                this.sizeOfControl.forEach(element => {
                    sizearr.push(this.Step2validateForm.value.sizeValue[element.id])
                });
                sizearr.forEach(element => {
                    this.formdata.append('size', element);
                });
                this.listOfControl.forEach(element => {
                    this.arr.push(element.value);
                });
                this.arr.forEach(element => {
                    this.formdata.append('price', element)
                });
                this.qtyOfControl.forEach(element => {
                    qtyarr.push(element.value);
                });
                qtyarr.forEach(element => {
                    this.formdata.append('stock_count', element)
                });
                 this.weightOfControl.forEach(element => {
                    weightarr.push(element.value);
                });
                weightarr.forEach(element => {
                    this.formdata.append('weight', element);
                   
                });
            }
            if (this.arr.length > 0) {
                for (let i = 0; i < this.arr.length; i++) {
                    this.available = this.arr[i] - ((this.arr[i] * this.Step2validateForm.value.discount) / 100);
                    this.formdata.append('available_price', this.available);
                }
            }
            else {
                this.available = this.Step2validateForm.value.price - ((this.Step2validateForm.value.price * this.Step2validateForm.value.discount) / 100);
                this.formdata.append('available_price', this.available);
            }

            this.fileList.forEach(element => {
                this.formdata.append('file', element)
            });
            this.tagtype.forEach(element => {
                this.formdata.append('type', element)
            });
              // this.formdata.append('type', this.tagtype)

            this.formdata.append('description', this.htmlContent);

            if (this.arr.some(function (el) { return el <= 0 })) {
                this.messge.error('Price should not be 0')
            }
            else if (this.arr.some(function (el) { return el === null })) {
                this.messge.error('Price should not be empty')
            }
            else if (qtyarr.some(function (el) { return el <= 0 })) {
                this.messge.error('Quantity should not be 0')
            }
            else if (qtyarr.some(function (el) { return el === null })) {
                this.messge.error('Quantity should not be empty')
            }
            else if (sizearr.some(function (el) { return el === "" })) {
                this.messge.error('Size should not be empty')
            }
            else {
                let data: Array<any> = [];
                let formdata1: any = new FormData();
        
                data.push(...this.formdata)
                data.forEach(element => {
                    console.log(element[1] == 'null' || element[1] == 'undefined' || element[1] == '')
                    if (element[1] == 'null' || element[1] == 'undefined' || element[1] == '') {
        
                    }
                    else {
                        formdata1.append(element[0], element[1])
                    }
                });
        

                this.product.updateProduct(formdata1).subscribe(res => {
                    if (res['success']) {
                        this.editLoading = false;
                        this.messge.success(res['message'])
                        this.Step1validateForm.reset();
                        this.Step2validateForm.reset();
                        this.router.navigate(['/product/list']);
                    }
                    else {
                        this.messge.error(res['message']);
                        this.editLoading = false;
                    }
                });
            }
        }
    }
    addField(e?: MouseEvent): void {
        if (e) {
            e.preventDefault();
        }
        const id = this.sizeOfControl.length > 0 ? this.sizeOfControl[this.sizeOfControl.length - 1].id + 1 : 0;

        const control = {
            id,
            controlInstance: `passenger${id}`,
            value: null
        };
        const index = this.sizeOfControl.push(control);
        const index1 = this.listOfControl.push({
            id: id,
            controlInstance: `price${id}`,
            value: 0

        })
        const index2 = this.qtyOfControl.push({
            id: id,
            controlInstance: `qty${id}`,
            value: 0

        })
        const index3 = this.weightOfControl.push({
            id: id,
            controlInstance: `weight${id}`,
            value: 0

        })
    }

    removeField(i: { id: number; controlInstance: string; value: number }, e: MouseEvent): void {
        e.preventDefault();
        if (this.sizeOfControl.length > 1) {
            const index = this.sizeOfControl.indexOf(i);
            this.sizeOfControl.splice(index, 1);
            const index1 = this.listOfControl.indexOf(i);
            this.listOfControl.splice(index1, 1);
            const index2 = this.qtyOfControl.indexOf(i);
            this.qtyOfControl.splice(index2, 1);
            const index3 = this.weightOfControl.indexOf(i);
            this.weightOfControl.splice(index3, 1);
        }
    }
   
    public getAllProduct(id) {
        this.product.GetProduct().subscribe(res => {
            for (let el of res.data) {
                if (el._id == id) {
                     this.name = el['name'];
                    this.product_id = el['product_id'];
                    this.Category = el['category_id'];
                    this.product_price = el["price_by"];
                    this.size_available = el['size'];
                    this.percentage = el['offer_percentage'];
                    this.stockValue = el['stock_available'] == false ? 'false' : 'true';
                    // this.selectedGender = el['gender'];
                    this.tagtype = el['type'];
                    this.imageList = el['file'];
                    if (this.product_price == 'FIXED') {
                        this.size = el['size'];
                        this.price = el['price'];
                        this.quantity = el['stock_count'];
                        this.stype = el['sub_type'];
                        this.weight = el['weight'];

                    }
                    else {
                        this.price = el['price'];
                        this.size = el['size'];
                        this.quantity = el['stock_count'];
                        this.stype = el['sub_type'];
                        this.weight = el['weight'];
                         for (let i = 0; i < this.size.length; i++) {
                            const index = this.sizeOfControl.push({
                                id: i,
                                controlInstance: `passenger${i}`,
                                value: this.size[i]
                            })


                        }

                        for (let j = 0; j < this.price.length; j++) {
                            const index1 = this.listOfControl.push({
                                id: j,
                                controlInstance: `price${j}`,
                                value: this.price[j]

                            })
                        }
                        for (let q = 0; q < this.quantity.length; q++) {
                            const index2 = this.qtyOfControl.push({
                                id: q,
                                controlInstance: `qty${q}`,
                                value: this.quantity[q]

                            })
                        }
                        for (let we = 0; we < this.weight.length; we++) {
                             const index3 = this.weightOfControl.push({
                                id: we,
                                controlInstance: `weight${we}`,
                                value: this.weight[we]
                            })


                        }

                    }

                    for (let j = 0; j < this.imageList.length; j++) {
                        this.preview.push(this.url + this.imageList[j].path);
                    }
                    this.htmlContent = el['description'];
                 }
            }
        });
    }

    getSubType() {
        this.subtype.GetAllSubType().subscribe(res => {
            if (res['success']) {
                this.SubtypeList = res['data'];
               
            }
        })
    }

    ImageDelete(val,){
        let data = {
            id:this.productid,
            index:val
        }
        this.product.DeleteImage(data).subscribe((res)=>{
            console.log(res,'delted')
        })
    }

   

}
