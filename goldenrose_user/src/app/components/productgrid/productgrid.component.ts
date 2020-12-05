import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from 'src/app/services/category.service';
import { CartService } from 'src/app/services/cart.service';
import { WishlistService } from 'src/app/services/wishlist.service';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/header/header.component';
declare var $: any;
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Constants } from 'src/app/shared/constants/constants';
import { TranslateService } from '@ngx-translate/core';
import { validLanguage } from 'src/app/helpers/languages';

@Component({
    selector: 'app-productgrid',
    templateUrl: './productgrid.component.html',
    styleUrls: ['./productgrid.component.less'],
})
export class ProductgridComponent implements OnInit {
    @ViewChild('myChild') private myChild: HeaderComponent;
    // validateForm!: FormGroup;

    // submitForm(): void {
    //     for (const i in this.validateForm.controls) {
    //         this.validateForm.controls[i].markAsDirty();
    //         this.validateForm.controls[i].updateValueAndValidity();
    //     }
    // }
    sortValue = 0;
    rangeValue = [0, 5000];
    range = [0, 5000];
    minrange;
    maxrange;
    formatter(rangeValue: number): string {
        return '€' + `${rangeValue}`;
    }
    // NZ Zorro Carousel
    @ViewChild(NzCarouselComponent, { static: false })
    myCarousel: NzCarouselComponent;

    categoryValue = 'All';
    brandValue = 'A';
    //Product
    listOfData = [];
    productListofData = [];
    isLoading = false;
    url = Constants.baseUrl;
    userId = localStorage.getItem('userId');
    isloggedin = localStorage.getItem('isLoggedIn');
    //Counter
    showcount = true;
    carouselProduct = [];

    //Category
    categoryList = [];


    //routePrams
    category_id;
    resultData = [];
    typeList = [];
    searchValue;
    cattype;
    //dynamic
    public sub_cat_id;

    price_amount1 = new FormControl(null, [Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]);

    constructor(
        private product: ProductService,
        private category: CategoryService,
        private wish: WishlistService,
        private carts: CartService,
        private message: NzMessageService,
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService
    ) { }

    ngOnInit(): void {
        this.translate.use(validLanguage(localStorage.getItem('locale')));


        this.category_id = this.route.snapshot.paramMap.get('id');
        this.blockTag();

        this.categorys();

        this.category.GetType().subscribe((res) => {
            this.typeList = res['data'];
        });

        if (this.category_id != null) {
            this.route.params.subscribe((routeParams) => {
                this.sampleitem = [];
                this.listOfData = [];
                this.cattype = routeParams.type;
                if (this.router.url == '/grid/' + routeParams.id + '/' + routeParams.type +'/'+ routeParams.subtype) {
                    this.categoryList = [];
                    if (routeParams.id != 'type' && routeParams.id !== 'search') {
                        this.productBySubType(routeParams.id, routeParams.type,routeParams.subtype);
                        this.sub_cat_id = localStorage.getItem('catname');
                        this.categoryValue = routeParams.id;
                        setTimeout(() => {
                            this.eventchange(1, 12)
                        }, 1000);
                        this.category.CategoryByType().subscribe((res) => {
                            this.categoryList = res['data'];
                            this.categoryList = this.categoryList[routeParams.type];
                        });
                    } else if (routeParams.id !== 'search') {
                        this.sub_cat_id = routeParams.type;
                        this.productByType(routeParams.type);
                        setTimeout(() => {
                            this.eventchange(1, 12)
                        }, 1000);
                        this.category.CategoryByType().subscribe((res) => {
                            this.categoryList = res['data'];
                            this.categoryList = this.categoryList[routeParams.type];
                        });
                    } else {
                        this.searchValue = routeParams.type;
                        this.product.SearchProduct(this.searchValue).subscribe((res) => {
                            if (res['success']) {
                                this.listOfData = res['data'];
                                for (let i = 0; i < this.listOfData.length; i++) {
                                    this.listOfData[i].iswishlisted = false;
                                    this.listOfData[i].productcount = 1;
                                    this.listOfData[i].price_id = 0;
                                    let products = this.listOfData[i].wishlist;
                                    for (let j = 0; j < products.length; j++) {
                                        this.listOfData[i].id = i;
                                        if (products[j] == this.userId) {
                                            this.listOfData[i].iswishlisted = true;
                                        }
                                    }

                                }
                            }
                        });
                        this.categorys();
                        setTimeout(() => {
                            this.eventchange(1, 12)
                        }, 1000);
                    }
                }
                else if(this.router.url == '/grid/' + routeParams.id + '/' + routeParams.type){
                     if (routeParams.id !== 'search') {
                        this.sub_cat_id = routeParams.type;
                        this.productByType(routeParams.type);
                        setTimeout(() => {
                            this.eventchange(1, 12)
                        }, 1000);
                        this.category.CategoryByType().subscribe((res) => {
                            this.categoryList = res['data'];
                            this.categoryList = this.categoryList[routeParams.type];
                        });
                    } else if(routeParams.id == 'search') {
                        this.searchValue = routeParams.type;
                        this.product.SearchProduct(this.searchValue).subscribe((res) => {
                            if (res['success']) {
                                this.listOfData = res['data'];
                                for (let i = 0; i < this.listOfData.length; i++) {
                                    this.listOfData[i].iswishlisted = false;
                                    this.listOfData[i].productcount = 1;
                                    this.listOfData[i].price_id = 0;
                                    let products = this.listOfData[i].wishlist;
                                    for (let j = 0; j < products.length; j++) {
                                        this.listOfData[i].id = i;
                                        if (products[j] == this.userId) {
                                            this.listOfData[i].iswishlisted = true;
                                        }
                                    }

                                }
                            }
                        });
                        this.categorys();
                        setTimeout(() => {
                            this.eventchange(1, 12)
                        }, 1000);
                    }
                    else{
                        this.productByType(routeParams.type)
                        this.sub_cat_id = localStorage.getItem('catname');
                        this.categoryValue = 'All';
                        setTimeout(() => {
                            this.eventchange(1, 12)
                        }, 1000);
                        this.category.CategoryByType().subscribe((res) => {
                            this.categoryList = res['data'];
                            this.categoryList = this.categoryList[routeParams.type];
                        });
                   
                   
                    }
                }
                   
            });

        } else {
            this.productList();
            setTimeout(() => {
                this.eventchange(1, 12)
            }, 1000);

        }


    }
    index = 1;
    size = 12;
    sampleitem = [];
    eventchange(pagenumber, si) {
        if (this.listOfData.length > 0) {
            this.sampleitem = this.listOfData.slice((pagenumber - 1) * si, pagenumber * si);
        }
    }
    productList() {
        this.listOfData = [];
        this.product.ProductAll().subscribe((res) => {
            // this.listOfData = res['data'];
            if (res['success']) {
                for (let i = 0; i < res['data'].length; i++) {
                    if(res['data'][i].stock_count !=  0){
                        this.listOfData.push(res['data'][i])
                    }
                }
                for(let i= 0 ; i< this.listOfData.length;i++){
                    this.listOfData[i].iswishlisted = false;
                this.listOfData[i].productcount = 1;
                for(let j = 0; j< this.listOfData[i].stock_count.length ; j++){
                    if(this.listOfData[i].stock_count[j] != 0){
                        this.listOfData[i].price_id = j;
                         break;
                    }
                }
                // this.listOfData[i].price_id = 0;
                let products = this.listOfData[i].wishlist;
                for (let j = 0; j < products.length; j++) {
                    this.listOfData[i].id = i;
                    if (products[j] == this.userId) {
                        this.listOfData[i].iswishlisted = true;
                    }
                 }
                }
                
                this.productListofData = this.listOfData;
                 this.sampleitem = this.listOfData;
                if (this.searchValue == '' || this.searchValue == null) {
                    this.listOfData = [...this.productListofData];
                } else {
                    this.listOfData = this.productListofData.filter((item) => {
                        if (item.name) {
                            if (
                                item.name
                                    .toLowerCase()
                                    .includes(this.searchValue.toLowerCase())
                            )
                                return item.name
                                    .toLowerCase()
                                    .includes(this.searchValue.toLowerCase());
                        }

                    });
                }
            }
        });
    }

    categorys() {
        this.category.CategoryAll().subscribe((res) => {
            let list = [];
            list = res['data'];
            this.categoryList = [];
            list.forEach((element) => {
                if (element.status == true) {
                    this.categoryList.push(element);
                }
            });
        });
        // this.ProductAll();
    }

    blockTag() {
        $('.open-item').click(function () {
            if ($(this).hasClass('closetag')) {
                $('.block-tag').animate(
                    {
                        height: '108px',
                    },
                    500,
                    function () { }
                );
                $(this).addClass('opentag');
                $(this).removeClass('closetag');
            } else {
                $('.block-tag').animate(
                    {
                        height: '54px',
                    },
                    500,
                    function () { }
                );
                $(this).addClass('closetag');
                $(this).removeClass('opentag');
            }
        });
    }
    AddProduct = false;
    //Product Count
    Addcount(i) {
        if (
            this.listOfData[i].stock_count[this.listOfData[i].price_id] <
            this.listOfData[i].productcount + 1
        ) {
            this.message.error(
                'We are sorry!only available quantity: ' +
                this.listOfData[i].stock_count[this.listOfData[i].price_id]
            );
            this.AddProduct = true;
        } else {
            this.AddProduct = false;
            this.listOfData[i].productcount =
                this.listOfData[i].productcount + 1;
        }
    }
    Removecount(i) {
        if (this.listOfData[i].productcount == 1) {
            this.showcount = false;
        } else {
            this.listOfData[i].productcount =
                this.listOfData[i].productcount - 1;
        }
    }
    productByCategory(id, val) {
         if (id == 'All') {
            if(this.cattype == 'WOMEN' || this.cattype == 'MEN' || this.cattype == 'COMMUNION' || this.cattype == 'BABYBORN'){
                this.sub_cat_id = id;
                this.categoryValue = id;
                this.productByType(this.cattype);
            }
            else{
                this.categoryValue = id;
                this.sub_cat_id = id;
                this.productList();
            }
        }
        else if(val != 'WOMEN' && val != 'MEN' && val != 'COMMUNION' && val != 'BABYBORN'){
            this.listOfData = [];
            this.productListofData = [];
            this.product.ProductByCategoryId(id).subscribe((res) => {
                // this.listOfData = res['data'];
                 if (res['success']) {
                    for (let i = 0; i < res['data'].length; i++) {
                        if(res['data'][i].stock_count !=  0){
                            this.listOfData.push(res['data'][i])
                        }
                    }
                    for(let i= 0 ; i< this.listOfData.length;i++){
                        this.listOfData[i].iswishlisted = false;
                    this.listOfData[i].productcount = 1;
                    for(let j = 0; j< this.listOfData[i].stock_count.length ; j++){
                        if(this.listOfData[i].stock_count[j] != 0){
                            this.listOfData[i].price_id = j;
                             break;
                        }
                    }
                    // this.listOfData[i].price_id = 0;
                    let products = this.listOfData[i].wishlist;
                    for (let j = 0; j < products.length; j++) {
                        this.listOfData[i].id = i;
                        if (products[j] == this.userId) {
                            this.listOfData[i].iswishlisted = true;
                        }
                     }
                    }
                    this.productListofData = this.listOfData;
                     this.sampleitem = this.listOfData;
              
                }
            });
       
        }
         else {
             this.listOfData = [];
               this.categoryValue = id;
            this.product.ProductByCategory(id, val).subscribe((res) => {
                // this.listOfData = res['data'];
                // this.sampleitem = this.listOfData;
                if (res['success']) {
                    for (let i = 0; i < res['data'].length; i++) {
                        if(res['data'][i].stock_count !=  0){
                            this.listOfData.push(res['data'][i])
                        }
                    }
                    for(let i= 0 ; i< this.listOfData.length;i++){
                        this.listOfData[i].iswishlisted = false;
                    this.listOfData[i].productcount = 1;
                    for(let j = 0; j< this.listOfData[i].stock_count.length ; j++){
                        if(this.listOfData[i].stock_count[j] != 0){
                            this.listOfData[i].price_id = j;
                             break;
                        }
                    }
                    // this.listOfData[i].price_id = 0;
                    let products = this.listOfData[i].wishlist;
                    for (let j = 0; j < products.length; j++) {
                        this.listOfData[i].id = i;
                        if (products[j] == this.userId) {
                            this.listOfData[i].iswishlisted = true;
                        }
                     }
                    }
                    
                    this.productListofData = this.listOfData;
                     this.sampleitem = this.listOfData;
                }
            });
        }
    }

    productByType(id) {
        this.listOfData = [];
        this.product.ProductByType(id).subscribe((res) => {
            // this.listOfData = res['data'];
            if (res['success']) {
                for (let i = 0; i < res['data'].length; i++) {
                    if(res['data'][i].stock_count !=  0){
                        this.listOfData.push(res['data'][i])
                    }
                }
                for(let i= 0 ; i< this.listOfData.length;i++){
                    this.listOfData[i].iswishlisted = false;
                this.listOfData[i].productcount = 1;
                for(let j = 0; j< this.listOfData[i].stock_count.length ; j++){
                    if(this.listOfData[i].stock_count[j] != 0){
                        this.listOfData[i].price_id = j;
                         break;
                    }
                }
                // this.listOfData[i].price_id = 0;
                let products = this.listOfData[i].wishlist;
                for (let j = 0; j < products.length; j++) {
                    this.listOfData[i].id = i;
                    if (products[j] == this.userId) {
                        this.listOfData[i].iswishlisted = true;
                    }
                 }
                }
                
                this.productListofData = this.listOfData;
                 this.sampleitem = this.listOfData;
            }
        });
    }

    ProductAll() {
        this.product.ProductAll().subscribe((res) => {
            let listdata = res['data'];
            listdata = listdata.reverse();
            if (res['success']) {
                for (let i = 0; i < listdata.length; i++) {
                    if (listdata[i].stock_available == true) {
                        this.carouselProduct.push(listdata[i]);
                    }
                }
                for (let i = 0; i < this.carouselProduct.length; i++) {
                    this.carouselProduct[i].iswishlisted = false;
                    this.carouselProduct[i].productcount = 1;
                    this.carouselProduct[i].price_id = 0;
                    let products = this.carouselProduct[i].wishlist;
                    for (let j = 0; j < products.length; j++) {
                        if (products[j] == this.userId) {
                            this.carouselProduct[i].iswishlisted = true;
                        }
                    }
                }
            }
        });
    }

    //Cart
    addCart(data, i) {
        if (this.isloggedin) {
            this.carts
                .AddCart({
                    id: data._id,
                    price_id: this.listOfData[i].price_id,
                    qty: this.listOfData[i].productcount,
                })
                .subscribe((res) => {
                    this.isLoading = true;
                    if (res['success']) {
                        this.message.success(res['message']);
                        this.myChild.ngOnInit();
                        this.isLoading = false;
                        this.cartAll();
                        // location.reload();
                    } else {
                        this.isLoading = false;
                    }
                });

        }
        else {
            this.carts
                .GuestAddCart({
                    id: data._id,
                    price_id: this.listOfData[i].price_id,
                    qty: this.listOfData[i].productcount,
                })
                .subscribe((res) => {
                    this.isLoading = true;
                    if (res['success']) {
                        this.message.success(res['message']);
                        this.myChild.ngOnInit();
                        this.isLoading = false;
                        this.cartAll();
                        // location.reload();
                    } else {
                        this.isLoading = false;
                    }
                });

        }

    }
    addPremiumCart(data, i) {
        if (this.isloggedin) {
            this.carts
                .AddCart({
                    id: data._id,
                    price_id: data.price_id,
                    qty: data.productcount,
                })
                .subscribe((res) => {
                    this.isLoading = true;
                    if (res['success']) {
                        this.message.success(res['message']);
                        this.isLoading = false;
                        this.myChild.ngOnInit();
                        this.cartAll();
                    } else {
                        this.isLoading = false;
                    }
                });

        }
        else {
            this.carts
                .GuestAddCart({
                    id: data._id,
                    price_id: data.price_id,
                    qty: data.productcount,
                })
                .subscribe((res) => {
                    this.isLoading = true;
                    if (res['success']) {
                        this.message.success(res['message']);
                        this.isLoading = false;
                        this.myChild.ngOnInit();
                        this.cartAll();
                    } else {
                        this.isLoading = false;
                    }
                });

        }
    }

    cartAll() {
        if (this.isloggedin) {
            this.carts.CartAll().subscribe((res) => { });
        }
        else {
            this.carts.GuestCartAll().subscribe((res) => {
            });
        }
    }
    //WishList
    addWish(data, i) {
        this.wish.WishAdd(data._id).subscribe((res) => {
            if (res['success']) {
                this.message.success(res['message']);
                this.listOfData[i].iswishlisted = true;
            }
        });
    }

    removeWish(data, i) {
        this.wish.WishDelete(data._id).subscribe((res) => {
            if (res['success']) {
                this.message.success(res['message']);
                this.listOfData[i].iswishlisted = false;
            }
        });
    }

    //Range slider
    sliderrange = [];
    rangeSort(min, max) {
        this.sliderrange = [];
        if (this.minrange == 0 && this.maxrange == 0) {
            this.sliderrange = this.productListofData;
        }
        if (this.minrange == 0 && this.maxrange != 0) {
            for (let i = 0; i < this.productListofData.length; i++) {
                if (this.productListofData[i].available_price[0] <= max) {
                    this.sliderrange.push(this.productListofData[i]);
                }
            }
        }
        else if (this.maxrange == 0 && this.minrange != 0) {
            for (let i = 0; i < this.productListofData.length; i++) {
                if (this.productListofData[i].available_price[0] >= min) {
                    this.sliderrange.push(this.productListofData[i]);
                }
            }
        }
        else {
            for (let i = 0; i < this.productListofData.length; i++) {
                if (this.productListofData[i].available_price[0] <= max && this.productListofData[i].available_price[0] >= min) {
                    this.sliderrange.push(this.productListofData[i])
                }
            }
        }

        this.listOfData = this.sliderrange;
        this.sampleitem = this.listOfData;

    }

    clearSort() {
        this.minrange = 0;
        this.maxrange = 0;
        this.sliderrange = [];
       this.ngOnInit();
    }

    // rangeSortValue(data) {
    //     this.rangeSort([data, this.rangeValue[1]]);
    //     this.range = [data, this.rangeValue[1]];
    // }

    getCatname(val) {
        this.categoryList.forEach(element => {
            if (element._id == val) {
                localStorage.setItem('catname', element.name);
                this.sub_cat_id = localStorage.getItem('catname')
            }
        });
    }

    productBySubType(id,val,sub) {
        this.listOfData = [];
        this.product.ProductBySubtype(id,val,sub).subscribe((res) => {
            // this.listOfData = res['data'];
            if (res['success']) {
               
                if(res['data'].length>0){
                for (let i = 0; i < res['data'].length; i++) {
                    if(res['data'][i].stock_count !=  0){
                        this.listOfData.push(res['data'][i])
                    }
                }
                for(let i= 0 ; i< this.listOfData.length;i++){
                    this.listOfData[i].iswishlisted = false;
                this.listOfData[i].productcount = 1;
                for(let j = 0; j< this.listOfData[i].stock_count.length ; j++){
                    if(this.listOfData[i].stock_count[j] != 0){
                        this.listOfData[i].price_id = j;
                         break;
                    }
                }
                // this.listOfData[i].price_id = 0;
                let products = this.listOfData[i].wishlist;
                for (let j = 0; j < products.length; j++) {
                    this.listOfData[i].id = i;
                    if (products[j] == this.userId) {
                        this.listOfData[i].iswishlisted = true;
                    }
                 }
                }
            }
                this.productListofData = this.listOfData;
                 this.sampleitem = this.listOfData;
            }
        });
    }
}
