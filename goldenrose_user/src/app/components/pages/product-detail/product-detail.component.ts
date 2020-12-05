import { Component, OnInit, ViewChild, Input, ElementRef, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
declare var $: any;
declare var jQuery: any;
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WishlistService } from 'src/app/services/wishlist.service';
import { Constants } from 'src/app/shared/constants/constants';
import { TranslateService } from '@ngx-translate/core';
import { validLanguage } from 'src/app/helpers/languages';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.less'],
})
export class ProductDetailComponent implements OnInit {
    zoom = 3;
    imgWidth;
    imgHeigth;

    posX: number = 0;
    posY: number = 0;
    cx: number = 1;
    cy: number = 1;
    yet: boolean = false;
    factorX: number;
    factorY: number;

    private mouseMovement = new Subject();
    @ViewChild('img', { static: false, read: ElementRef }) img;
    @ViewChild('lens', { static: false, read: ElementRef }) lens;
    @ViewChild('divZoomed', { static: false, read: ElementRef }) divZoomed;

    onMouseMove(e) {
        const result = this.moveLens(e);
        this.render.setStyle(this.divZoomed.nativeElement, 'background-position', result);
        this.render.setStyle(this.divZoomed.nativeElement, 'opacity', '1');
        this.render.setStyle(this.divZoomed.nativeElement, 'transform', "scale(1)");
    }

    onMouseOut() {
        this.render.setStyle(this.divZoomed.nativeElement, 'opacity', '0');
        this.render.setStyle(this.divZoomed.nativeElement, 'transform', "scale(0)");
    }

    //carousel
    carouselProduct = [];
    url = Constants.baseUrl;
    rating = [1, 2, 3, 4, 5];
    rate;
    count = 1;
    //Product
    productList = [];
    listOfData = [];
    reviewValue?: string;
    productsize;
    productId;
    popUpImg;
    AddProduct = false;
    showcount = true;
    Addcount(i) {
        // console.log(  this.listOfData[i].stock_count[this.priceInd])
        if (
            this.productList[i].stock_count[this.priceInd] <
            this.productList[i].productcount + 1
        ) {
            this.message.error(
                'We are sorry!only available quantity: ' +
                this.productList[i].stock_count[this.priceInd]
            );
            this.AddProduct = true;
        } else {
            this.AddProduct = false;
            this.productList[i].productcount =
                this.productList[i].productcount + 1;
        }
    }
    Removecount(i) {
        if (this.productList[i].productcount == 1) {
            this.showcount = false;
        } else {
            this.productList[i].productcount =
                this.productList[i].productcount - 1;
        }
    }

    productImg = [];
    product_size = [];
    userId = localStorage.getItem('userId');
    review = [];
    over(imgIn) {
        this.popUpImg = imgIn;
    }

    out(imgOut) {
        this.popUpImg = imgOut;
    }


    // Add Card -- Modal
    rateReviewVisible = false;

    rateReview(): void {
        this.rateReviewVisible = true;
    }

    rateCardhandleOk(): void {
        this.rateReviewVisible = false;
    }

    rateCardhandleCancel(): void {
        this.rateReviewVisible = false;
    }

    constructor(private fb: FormBuilder,
        private router: Router,
        private product: ProductService,
        private route: ActivatedRoute,
        private carts: CartService,
        private message: NzMessageService,
        private wish: WishlistService,
        private translate: TranslateService,
        private render: Renderer2,
    ) { }
    validateForm!: FormGroup;
    ratValue(id) {
        this.rate = id;
    }
    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
        if (this.validateForm.valid) {
            let val = {
                id: this.productId,
                review: this.validateForm.value.review,
                rating: this.rate
            }
            this.product.ProductRating(val).subscribe((res) => {
                if (res['success']) {
                    this.review = res['data']['review'];
                    +                    this.review.sort(function (a, b) { return b.rating - a.rating });
                    this.message.success(res['message']);
                    this.rateReviewVisible = false;

                }
                else {
                    this.message.error(res['message']);
                    this.rateReviewVisible = false;

                }
            })
        }
    }


    ngOnInit(): void {
        this.translate.use(validLanguage(localStorage.getItem('locale')));
        this.productId = this.route.snapshot.paramMap.get('id');

        this.clickPopup();
        this.upsellPro();
        this.moreViews();
        this.ProductAll();
        this.route.params.subscribe(routeParams => {
            this.ProductById(routeParams.id);
        });
        this.changeprice(0)
        // console.log(this.popUpImg)
        this.validateForm = this.fb.group({
            nickName: [null],
            summary: [null],
            review: [null],
        });
    }

    // Image Magnifying Zoom -- start
    onLoad() {
        /*set background properties for the result DIV:*/

        this.render.setStyle(this.divZoomed.nativeElement, 'background-image', "url('" + this.img.nativeElement.src + "')");
        this.render.setStyle(this.divZoomed.nativeElement, 'background-size', (this.img.nativeElement.width * this.zoom) + "px " + (this.img.nativeElement.height * this.zoom) + "px")
        this.render.setStyle(this.divZoomed.nativeElement, 'background-repeat', 'no-repeat')
        this.render.setStyle(this.divZoomed.nativeElement, 'transition', 'background-position .2s ease-out');
        /*image width and height:*/
        this.factorX = this.img.nativeElement.width;
        this.factorY = this.img.nativeElement.height;
        this.yet = true;
        setTimeout(() => {
            this.factorX = this.imgWidth || this.imgHeigth ? this.factorX / this.img.nativeElement.width : 1
            this.factorY = this.imgWidth || this.imgHeigth ? this.factorY / this.img.nativeElement.height : 1
            const dim = (this.divZoomed.nativeElement as any).getBoundingClientRect()
            this.cx = (dim.width - this.img.nativeElement.width * this.zoom * this.factorX) / (this.img.nativeElement.width - this.lens.nativeElement.offsetWidth);
            this.cy = (dim.height - this.img.nativeElement.height * this.zoom * this.factorY) / (this.img.nativeElement.height -
                this.lens.nativeElement.offsetHeight);
        })
    }

    moveLens(e: any) {
        let pos;
        let x;
        let y;
        /*prevent any other actions that may occur when moving over the image:*/
        e.preventDefault();
        /*get the cursor's x and y positions:*/
        pos = this.getCursorPos(e);
        /*calculate the position of the lens:*/
        x = pos.x - (this.lens.nativeElement.offsetWidth / 2);
        y = pos.y - (this.lens.nativeElement.offsetHeight / 2);
        /*prevent the lens from being positioned outside the image:*/
        if (x > this.img.nativeElement.width - this.lens.nativeElement.offsetWidth) { x = this.img.nativeElement.width - this.lens.nativeElement.offsetWidth; }
        if (x < 0) { x = 0; }
        if (y > this.img.nativeElement.height - this.lens.nativeElement.offsetHeight) { y = this.img.nativeElement.height - this.lens.nativeElement.offsetHeight; }
        if (y < 0) { y = 0; }
        /*set the position of the lens:*/
        this.posX = x;
        this.posY = y;
        /*display what the lens "sees":*/
        let result = (x * this.cx) + "px " + (y * this.cy) + "px"
        return result;
    }

    getCursorPos(e) {
        let a, x = 0, y = 0;
        e = e || window.event;
        /*get the x and y positions of the image:*/
        a = this.img.nativeElement.getBoundingClientRect();
        /*calculate the cursor's x and y coordinates, relative to the image:*/
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /*consider any page scrolling:*/
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
    }
    // Image Magnifying Zoom -- end

    moreViews() {
        var number = 5;
        jQuery('.jCarouselLite').jCarouselLite({
            btnNext: '.more-views .next',
            btnPrev: '.more-views .prev',
            visible: number,
            start: 0,
            circular: true,
            speed: 300,
            vertical: true,
        });
    }

    clickPopup() {
        $(".Click-here").on('click', function () {
            $(".custom-model-main").addClass('model-open');
        });
        $(".close-btn, .bg-overlay").click(function () {
            $(".custom-model-main").removeClass('model-open');
        });
    }

    upsellPro() {
        $('#upsell_pro .wrap_item').owlCarousel({
            items: 4,
            itemsCustom: [
                [0, 1],
                [480, 2],
                [768, 3],
                [992, 4],
                [1200, 4],
            ],
            pagination: false,
            slideSpeed: 800,
            addClassActive: true,
            afterAction: function (e) {
                if (this.$owlItems.length && this.options.items) {
                    $('#upsell_pro .navslider').show();
                } else {
                    $('#upsell_pro .navslider').hide();
                }
            },
        });
        $('#upsell_pro .navslider .prev').on('click', function (e) {
            e.preventDefault();
            $('#upsell_pro .wrap_item').trigger('owl.prev');
        });
        $('#upsell_pro .navslider .next').on('click', function (e) {
            e.preventDefault();
            $('#upsell_pro .wrap_item').trigger('owl.next');
        });
    }

    //Product
    ProductAll() {
        this.product.ProductAll().subscribe((res) => {
            let listdata = res['data'];
            listdata = listdata.reverse();
            if (res['success']) {
                for (let i = 0; i < 2; i++) {
                    this.carouselProduct.push(listdata[i]);
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

    ProductById(id) {
        this.productList = [];
        this.product.ProductById(id).subscribe((res) => {
            this.productList.push(res['data']);
            for (let i = 0; i < this.productList.length; i++) {
                this.productList[i].iswishlisted = false;
                this.productList[i].productcount = 1;
                let products = this.productList[i].wishlist;
                for (let j = 0; j < products.length; j++) {
                    if (products[j] == this.userId) {
                        this.productList[i].iswishlisted = true;
                    }
                }
            }
            this.productImg = res['data']['file'];
            this.popUpImg = this.productImg.length > 0 ? this.url + this.productImg[0].path : '';
            this.product_size = res['data']['size'];
            this.productsize = this.product_size[0];
            this.review = res['data']['review'];
            this.review.sort(function (a, b) { return b.rating - a.rating });
        });
    }
    addCart(data, i) {
        this.carts
            .AddCart({
                id: data._id,
                price_id: this.listOfData[i].price_id,
                qty: this.listOfData[i].productcount,
            })
            .subscribe((res) => {
                if (res['success']) {
                    this.message.success(res['message']);

                }

            });
    }

    addPremiumCart(data, i) {
        this.carts
            .AddCart({
                id: data._id,
                price_id: data.price_id,
                qty: data.productcount,
            })
            .subscribe((res) => {
                if (res['success']) {
                    this.message.success(res['message']);
                }

            });
    }
    //WishList
    addWish(data, i) {
        this.wish.WishAdd(data._id).subscribe((res) => {
            if (res['success']) {
                this.message.success(res['message']);
                this.productList[i].iswishlisted = true;
            }
        });
    }

    removeWish(data, i) {
        this.wish.WishDelete(data._id).subscribe((res) => {
            if (res['success']) {
                this.message.success(res['message']);
                this.productList[i].iswishlisted = false;
            }
        });
    }
    priceInd = 0;

    changeprice(ind) {
        for (let i = 0; i < this.product_size.length; i++) {
            if (ind == this.product_size[i]) {
                this.priceInd = i;
            }
        }

    }

    changepricedup(ind, l) {
        this.productList[l].productcount = 1
        for (let i = 0; i < this.product_size.length; i++) {
            if (ind == this.product_size[i]) {
                this.priceInd = i;
            }
        }

    }

    Buy(detail, i) {
        this.carts
            .AddCart({
                id: detail._id,
                price_id: this.priceInd,
                qty: i,
            })
            .subscribe((res) => {
                if (res['success']) {
                    this.message.success(res['message']);
                    this.router.navigate(['/cart']);
                }

            });
    }
}
