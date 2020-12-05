import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { CategoryService } from 'src/app/services/category.service'
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { SubtypeService } from 'src/app/services/subtype.service';


@Component({
    selector: 'app-product-add',
    templateUrl: './product-add.component.html',
    styleUrls: ['./product-add.component.less'],
})
export class ProductAddComponent implements OnInit {
    listOfControl: Array<{ id: number; controlInstance: string; value: number }> = [];
    qtyOfControl: Array<{ id: number; controlInstance: string; value: number }> = [];
    weightOfControl: Array<{ id: number; controlInstance: string; value: number }> = [];

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
    selectedIndx = 0;
    preview = [];
    // Form -- Add Form
    Step1validateForm!: FormGroup;
    Step2validateForm!: FormGroup;

    size_available = [];
    // Select
    stockValue;
    selectedGender;
    Category;
    product_price;
    available = 0;
    Price = 0;
    tagtype = [];
    percentage = 0;
    sizeOfControl: Array<{ id: number; controlInstance: string }> = [];

    // Step -- Add Form
    step = 0;
    pre(): void {
        this.step -= 1;
    }

    next(): void {
        // if (this.fileList.length == 0) {
        //     this.messge.error('Upload Image')
        // }
        // else {
        this.step += 1;
        // }
    }

    done(): void {

    }

    constructor(private fb: FormBuilder, private subtype: SubtypeService, private sanitizer: DomSanitizer, private router: Router, private category: CategoryService, private product: ProductService, private messge: NzMessageService) { }
    fileList = [];
    Quantity = 0;
    previewImage: string | undefined = '';
    previewVisible = false;
    public formdata: any = new FormData();
    editLoading = false;
    arr = [];

    handlePreview = (file: NzUploadFile) => {
        this.previewImage = file.url || file.thumbUrl;
        this.previewVisible = true;
    };

    ngOnInit(): void {
        this.getCategory();
        this.getSubType();
        // Form -- Add Form
        this.Step1validateForm = this.fb.group({
            productName: [null, [Validators.required]],
            productID: [null],
            categoryname: [null],
        });

        this.Step2validateForm = this.fb.group({
            price: [null],
            productprice: [null],
            quantity: [null],
            weight: [null],
            // customsize: [null,[Validators.required]],
            discount: [null],
            stock: [null],
            // gender: [null],
            type: [null],
            sub_type: [null],
            sizeValue: [null],
            // shortDescription: [null, [Validators.required]],
            longDescription: [null],
            // colors:[null,[Validators.required]]
        });


    }

    priceValidate() {
        if (this.product_price == 'FIXED') {
            this.Step2validateForm = this.fb.group({
                price: [null],
                sizeValue: [null],
                productprice: [this.Step2validateForm.value.productprice],
                discount: [this.Step2validateForm.value.discount],
                stock: [this.Step2validateForm.value.stock],
                // gender: [this.Step2validateForm.value.gender],
                type: [this.Step2validateForm.value.type],
                sub_type: [this.Step2validateForm.value.sub_type],
                longDescription: [this.Step2validateForm.value.longDescription],
                quantity: [null, [Validators.min(1), Validators.pattern('^(0|\-?[1-9][0-9]*)$')]],
                // weight: [null, [Validators.min(1)]],


            });
        }
        else {
            this.Step2validateForm = this.fb.group({
                price: [null],
                sizeValue: [null],
                productprice: [this.Step2validateForm.value.productprice],
                discount: [this.Step2validateForm.value.discount],
                stock: [this.Step2validateForm.value.stock],
                // gender: [this.Step2validateForm.value.gender],
                type: [this.Step2validateForm.value.type],
                sub_type: [this.Step2validateForm.value.sub_type],
                longDescription: [this.Step2validateForm.value.longDescription],
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

    pricefield() {
        this.listOfControl = [];
        if (this.product_price == 'CUSTOM' && this.sizeOfControl.length > 0)
            for (let i = 0; i < this.sizeOfControl.length; i++) {
                const index = this.listOfControl.push({
                    id: i,
                    controlInstance: `price${i}`,
                    value: 0
                })
                this.Step2validateForm.addControl(
                    this.listOfControl[index - 1].controlInstance,
                    new FormControl(null, [Validators.min(1)])
                );
            }
    }
    weightfield() {
        this.weightOfControl = [];
        if (this.product_price == 'CUSTOM' && this.sizeOfControl.length > 0)
            for (let i = 0; i < this.sizeOfControl.length; i++) {
                const index = this.weightOfControl.push({
                    id: i,
                    controlInstance: `weight${i}`,
                    value: 0
                })
                this.Step2validateForm.addControl(
                    this.weightOfControl[index - 1].controlInstance,
                    new FormControl(null, [Validators.min(1)])
                );
            }
    }

    qtyfield() {
        this.qtyOfControl = [];
        if (this.product_price == 'CUSTOM' && this.sizeOfControl.length > 0)
            for (let i = 0; i < this.sizeOfControl.length; i++) {
                const index = this.qtyOfControl.push({
                    id: i,
                    controlInstance: `qty${i}`,
                    value: 0
                })
                this.Step2validateForm.addControl(
                    this.qtyOfControl[index - 1].controlInstance,
                    new FormControl(null, [Validators.min(1), Validators.pattern('^(0|\-?[1-9][0-9]*)$')])
                );
            }
    }


    onFileChange(e) {
        if (e.target.files && e.target.files[0]) {
            this.selectedIndx = 0;
            for (let i = 0; i < e.target.files.length; i++) {
                var reader = new FileReader();

                reader.onload = (data: any) => {
                    this.preview.push({
                        data: this.sanitizer.bypassSecurityTrustUrl(
                            data.target.result
                        ),
                        type: e.target.files[i].type.split('/')[0],
                    });
                };

                reader.readAsDataURL(e.target.files[i]);
                this.fileList.push(e.target.files[i]);
            }
        }
    }

    RemoveFile() {
        this.selectedIndx =
            this.selectedIndx < this.preview.length - 1
                ? this.selectedIndx++
                : this.selectedIndx - 1;
        this.fileList.splice(this.selectedIndx, 1);
        this.preview.splice(this.selectedIndx, 1);
    }

    public async submitForm() {

        // for (const i in this.Step2validateForm.controls) {
        //     this.Step2validateForm.controls[i].markAsDirty();
        //     this.Step2validateForm.controls[i].updateValueAndValidity();
        // }
        // if (this.product_price == 'CUSTOM') {
        //     for (const j in this.Step2validateForm.controls) {
        //         this.Step2validateForm.controls[j].markAsDirty();
        //         this.Step2validateForm.controls[j].updateValueAndValidity();
        //     }
        //     for (const x in this.Step2validateForm.controls) {
        //         this.Step2validateForm.controls[x].markAsDirty();
        //         this.Step2validateForm.controls[x].updateValueAndValidity();
        //     }
        // }

        // if (this.Step2validateForm.valid) {
        this.editLoading = true;
        this.formdata = new FormData();
        this.formdata.append('name', this.Step1validateForm.value.productName);
        this.formdata.append('product_id', this.Step1validateForm.value.productID);
        this.formdata.append('category_id', this.Category);
        // this.formdata.append('gender', this.Step2validateForm.value.gender);
        this.formdata.append('stock_available', this.Step2validateForm.value.stock);
        this.formdata.append('offer_percentage', this.Step2validateForm.value.discount);
        this.formdata.append('price_by', this.Step2validateForm.value.productprice);
        this.formdata.append('sub_type', this.Step2validateForm.value.sub_type)
        let sizearr = [];
        let weightarr = [];
        this.arr = [];
        if (this.product_price == 'FIXED') {
            this.formdata.append('price', this.Step2validateForm.value.price);
            this.formdata.append('size', this.Step2validateForm.value.sizeValue);
            this.formdata.append('stock_count', this.Step2validateForm.value.quantity);
            // this.formdata.append('weight', this.Step2validateForm.value.weight);

        }
        else {
            this.sizeOfControl.forEach(element => {
                sizearr.push(this.Step2validateForm.value[element.controlInstance])
            });
            sizearr.forEach(element => {
                this.formdata.append('size', element);
            });
            this.listOfControl.forEach(element => {
                this.arr.push(this.Step2validateForm.value[element.controlInstance]);
            });
            this.arr.forEach(element => {
                this.formdata.append('price', element);

            });
            let qtyarr = [];
            this.qtyOfControl.forEach(element => {
                qtyarr.push(this.Step2validateForm.value[element.controlInstance])
            });
            qtyarr.forEach(element => {
                this.formdata.append('stock_count', element);

            });

            this.weightOfControl.forEach(element => {
                weightarr.push(this.Step2validateForm.value[element.controlInstance])
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

        this.product.CreateProduct(formdata1).subscribe(res => {
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

        // }
    }
    addField(e?: MouseEvent): void {
        if (e) {
            e.preventDefault();
        }
        const id = this.sizeOfControl.length > 0 ? this.sizeOfControl[this.sizeOfControl.length - 1].id + 1 : 0;

        const control = {
            id,
            controlInstance: `passenger${id}`
        };
        const index = this.sizeOfControl.push(control);
        this.pricefield();
        this.qtyfield();
        this.weightfield();
        this.Step2validateForm.addControl(
            this.sizeOfControl[index - 1].controlInstance,
            new FormControl(null)
        );
    }

    removeField(i: { id: number; controlInstance: string }, e: MouseEvent): void {
        e.preventDefault();
        if (this.sizeOfControl.length > 1) {
            const index = this.sizeOfControl.indexOf(i);
            this.sizeOfControl.splice(index, 1);
            this.pricefield();
            this.qtyfield();
            this.weightfield();
            this.Step2validateForm.removeControl(i.controlInstance);
        }
    }

    min0() {
        this.Quantity = this.Quantity < 0 ? 0 : this.Quantity;
        this.Price = this.Price < 0 ? 0 : this.Price;
    }

    cancel() {
        this.fileList = [];
        this.preview = [];
    }

    getSubType() {
        this.subtype.GetAllSubType().subscribe(res => {
            if (res['success']) {
                this.SubtypeList = res['data'];
            }
        })
    }

    minDiscount() {
        this.Step2validateForm.value.discount < 0 ? this.percentage = 0 : this.percentage;
        this.Step2validateForm.value.discount > 100 ? this.percentage = 100 : this.percentage;
    }

    minPrice() {
        this.Step2validateForm.value.price <= 0 ? this.Price = 1 : this.Price;
    }

}
