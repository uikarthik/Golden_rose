import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { SettingsService } from 'src/app/services/settings.service';
import { NzMessageService } from "ng-zorro-antd/message";
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { validLanguage } from 'src/app/helpers/languages';
import { Constants } from 'src/app/shared/constants/constants'

@Component({
    selector: 'app-site-setting',
    templateUrl: './site-setting.component.html',
    styleUrls: ['./site-setting.component.less'],
})
export class SiteSettingComponent implements OnInit {
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
    generalForm!: FormGroup;
    localForm!: FormGroup;
    discountForm!: FormGroup;
    seoForm!: FormGroup;
    deliveryForm!:FormGroup;
    public generalFormData: any = new FormData();
    sitemaintain: any;
    selectedTimeZone = null;
    selectedCurrency = null;
    selectedLanguage = null;
    
    fileListLight = [];
    fileListDark = [];
    fileListFav = [];
    fileListHead = [];
    previewImage: string | undefined = '';
    previewVisible = false;
    generaleditLoading = false;
    localeditLoading = false;
    discounteditLoading = false;
    seoeditLoading = false;
    handlePreview = (file: NzUploadFile) => {
        this.previewImage = file.url || file.thumbUrl;
        this.previewVisible = true;
    };

    email;
    siteaddress;
    copyright;
    twitter;
    telegram;
    youtube;
    facebook;
    linkedin;
    instagram;
    blog;
    androidlink;
    androidversion;
    ioslink;
    iosversion;
    logoURL = null;
    faviURL = null;
    headURL = null;
    terms = '';
    privacy = '';
    delivery_fee = 0;
    street;
    state;
    city;
    country;
    pin;
    mobile;
    
    //Deliverycharge
    ordermin;
    common_discount;
    ordermax;
    mindeli;
    maxdeli;
    belowmindeli;
    belowmaxdeli;
    url = Constants.baseUrl;
    constructor(private fb: FormBuilder, private settings: SettingsService, private message: NzMessageService,
        private translate: TranslateService) { }

    ngOnInit(): void {
        this.getSetting();
        this.deliveryForm = this.fb.group({
            ordermin:[null,[Validators.required,Validators.min(0)]],
            // ordermax:[null,[Validators.required,Validators.min(1)]],
            mindeli:[null,[Validators.required,Validators.min(0)]],
            maxdeli:[null,[Validators.required,Validators.min(0)]],
            belowmindeli:[null,[Validators.required,Validators.min(0)]],
            belowmaxdeli:[null,[Validators.required,Validators.min(0)]]

        });
        this.generalForm = this.fb.group({
            emailID: [null, [Validators.required]],
            siteAddress: [null, [Validators.required]],
            copy_rights: [null, [Validators.required]],
            street:[null,[Validators.required]],
            city:[null,[Validators.required]],
            state:[null,[Validators.required]],
            country:[null,[Validators.required]],
            pin:[null,[Validators.required]],
            mobile:[null,[Validators.required]]
            // site_maintain: [Validators.required],
            // terms: [null, [Validators.required]],
            // privacy: [null, [Validators.required]],
            // deliveryfee: [null, [Validators.required]]
        });
        this.localForm = this.fb.group({
            // timeZone: [null, [Validators.required]],
            currency: [null, [Validators.required]],
            language: [null, [Validators.required]],
        });
        this.discountForm = this.fb.group({
            common_discount: [null, [Validators.required]],
        });
        this.seoForm = this.fb.group({
            // siteTracker: [null, [Validators.required]],
            twitter: [null, [Validators.required]],
            // Terms: [null, [Validators.required]],
            facebook: [null, [Validators.required]],
            linkedIn: [null, [Validators.required]],
            instagram: [null, [Validators.required]],
            telegram: [null, [Validators.required]],
            youtube: [null, [Validators.required]],
            blog: [null, [Validators.required]],
        });


    }
    generalSubmit(): void {
        for (const i in this.generalForm.controls) {
            this.generalForm.controls[i].markAsDirty();
            this.generalForm.controls[i].updateValueAndValidity();
        }

        if (this.generalForm.valid) {
            this.generalFormData = new FormData();
            this.generaleditLoading = true;
            this.generalFormData.append('support_email', this.generalForm.value.emailID);
            this.generalFormData.append('site_name', this.generalForm.value.siteAddress);
            this.generalFormData.append('privacy', this.privacy);
            this.generalFormData.append('terms', this.terms);
            this.generalFormData.append('copy_rights', this.generalForm.value.copy_rights);
            this.generalFormData.append('user_site_maintainence', this.generalForm.value.site_maintain);
            this.generalFormData.append('delivery_fee', this.generalForm.value.deliveryfee);
            this.generalFormData.append('street',this.generalForm.value.street);
            this.generalFormData.append('city',this.generalForm.value.city);
            this.generalFormData.append('state', this.generalForm.value.state);
            this.generalFormData.append('country', this.generalForm.value.country);
            this.generalFormData.append('pincode', this.generalForm.value.pin);
            this.generalFormData.append('mobile', this.generalForm.value.mobile);
            if (this.fileListLight.length > 0) {
                this.generalFormData.append('logo', this.fileListLight[0]);
            } if (this.fileListFav.length > 0) {
                this.generalFormData.append('favicon', this.fileListFav[0]);
            }
            if (this.fileListHead.length > 0) {
                this.generalFormData.append('header_image', this.fileListHead[0]);
            }
            this.settings.Create(this.generalFormData).subscribe(res => {
                if (res['success']) {
                    this.generaleditLoading = false;
                    this.message.success(res['message']);
                   
                } else {
                    this.generaleditLoading = false;
                    this.message.error(res['message']);
                }
            });
        }

    }

    public localFormData: any = new FormData();

    localSubmit(): void {
        for (const i in this.localForm.controls) {
            this.localForm.controls[i].markAsDirty();
            this.localForm.controls[i].updateValueAndValidity();
        }
        if (this.localForm.valid) {
            this.localFormData = new FormData();
            this.localeditLoading = true;
            this.localFormData.append('currency', this.selectedCurrency);
            this.localFormData.append('language', this.selectedLanguage);
            this.localFormData.append('support_email', this.generalForm.value.emailID);
            this.localFormData.append('site_name', this.generalForm.value.siteAddress);
            this.localFormData.append('privacy', this.privacy);
            this.localFormData.append('terms', this.terms);
            this.localFormData.append('copy_rights', this.generalForm.value.copy_rights);
            this.localFormData.append('user_site_maintainence', this.generalForm.value.site_maintain);

            this.settings.Create(this.localFormData).subscribe(res => {
                if (res['success']) {
                    this.localeditLoading = false;
                    this.message.success(res['message']);
                    if(this.selectedLanguage == "spanish"){
                        localStorage.setItem('locale','es');
                        console.log(localStorage.getItem('locale'))
                        this.translate.use(validLanguage(localStorage.getItem('locale')));
                        document.documentElement.lang = localStorage.getItem('locale');
                    }
                    else{
                        localStorage.setItem('locale','en');
                        console.log(localStorage.getItem('locale'))
                        this.translate.use(validLanguage(localStorage.getItem('locale')));
                        document.documentElement.lang = localStorage.getItem('locale');
                    }

                } else {
                    this.localeditLoading = false;
                    this.message.error(res['message']);
                }
            });

        }

    }

    public discountFormData: any = new FormData();

    discountSubmit(): void {
        for (const i in this.discountForm.controls) {
            this.discountForm.controls[i].markAsDirty();
            this.discountForm.controls[i].updateValueAndValidity();
        }
        if (this.discountForm.valid) {
            this.discountFormData = new FormData();
            this.discounteditLoading = true;

            this.settings.CommonDiscount({common_discount:this.discountForm.value.common_discount}).subscribe(res => {
                if (res['success']) {
                    this.discounteditLoading = false;
                    this.message.success(res['message']);

                } else {
                    this.message.error(res['message']);

                }
            });

        }

    }


    public deliveryFormData: any = new FormData();
    deliveryeditLoading = false;
    deliverySubmit(): void {
        for (const i in this.deliveryForm.controls) {
            this.deliveryForm.controls[i].markAsDirty();
            this.deliveryForm.controls[i].updateValueAndValidity();
        }
        if (this.deliveryForm.valid) {
            this.deliveryFormData = new FormData();
            this.deliveryeditLoading = true;
            this.deliveryFormData.append('order_price', this.deliveryForm.value.ordermin);
            this.deliveryFormData.append('delivery_fee_above_min', this.deliveryForm.value.mindeli);
            this.deliveryFormData.append('delivery_fee_below_min', this.deliveryForm.value.belowmindeli);
            this.deliveryFormData.append('delivery_fee_above_max',this.deliveryForm.value.maxdeli);
            this.deliveryFormData.append('delivery_fee_below_max', this.deliveryForm.value.belowmaxdeli);
            this.deliveryFormData.append('support_email', this.generalForm.value.emailID);
            this.deliveryFormData.append('site_name', this.generalForm.value.siteAddress);
            this.deliveryFormData.append('privacy', this.privacy);
            this.deliveryFormData.append('terms', this.terms);
            this.deliveryFormData.append('copy_rights', this.generalForm.value.copy_rights);
            this.deliveryFormData.append('user_site_maintainence', this.generalForm.value.site_maintain);
           
            this.settings.Create(this.deliveryFormData).subscribe(res => {
                if (res['success']) {
                     this.deliveryeditLoading = false;
                    this.message.success(res['message']);
                } else {
                    this.message.error(res['message']);
                    this.deliveryeditLoading = false;
                   
                }
            });

        }

    }

    public seoFormData: any = new FormData();

    seoSubmit(): void {
        for (const i in this.seoForm.controls) {
            this.seoForm.controls[i].markAsDirty();
            this.seoForm.controls[i].updateValueAndValidity();
        }
        if (this.seoForm.valid) {
            this.seoFormData = new FormData();
            this.seoeditLoading = true;
            this.seoFormData.append('twitter', this.seoForm.value.twitter);
            this.seoFormData.append('linkedin', this.seoForm.value.linkedIn);
            this.seoFormData.append('blog', this.seoForm.value.blog);
            this.seoFormData.append('facebook', this.seoForm.value.facebook);
            this.seoFormData.append('telegram', this.seoForm.value.telegram);
            this.seoFormData.append('youtube', this.seoForm.value.youtube);
            this.seoFormData.append('instagram', this.seoForm.value.instagram);
            this.seoFormData.append('support_email', this.generalForm.value.emailID);
            this.seoFormData.append('site_name', this.generalForm.value.siteAddress);
            this.seoFormData.append('privacy', this.privacy);
            this.seoFormData.append('terms', this.terms);
            this.seoFormData.append('copy_rights', this.generalForm.value.copy_rights);
            this.seoFormData.append('user_site_maintainence', this.generalForm.value.site_maintain);
            // this.seoFormData.append('android_link',this.seoForm.value.androidlink);
            // this.seoFormData.append('ios_link',this.seoForm.value.ioslink);
            // this.seoFormData.append('android_version',this.seoForm.value.androidversion);
            // this.seoFormData.append('ios_version',this.seoForm.value.iosversion);
            this.settings.Create(this.seoFormData).subscribe(res => {
                if (res['success']) {
                    this.seoeditLoading = false;
                    this.message.success(res['message']);
                } else {
                    this.seoeditLoading = false;
                    this.message.error(res['message']);
                }
            });

        }
    }

    getSetting() {
        this.settings.GetSetting().subscribe(res => {
            if (res['success']) {
                this.email = res['data']['support_email'];
                this.siteaddress = res['data']['site_name'];
                this.copyright = res['data']['copy_rights'];
                this.sitemaintain = res['data']['user_site_maintainence'] == false ? 'false' : 'true';
                this.twitter = res['data']['twitter'];
                this.telegram = res['data']['telegram'];
                this.youtube = res['data']['youtube'];
                this.facebook = res['data']['facebook'];
                this.linkedin = res['data']['linkedin'];
                this.instagram = res['data']['instagram'];
                this.blog = res['data']['blog'];
                // this.androidlink = res['data']['android_link'];
                // this.androidversion = res['data']['android_version'];
                // this.ioslink = res['data']['ios_link'];
                // this.iosversion = res['data']['ios_version'];
                this.logoURL = this.url + res['data'].site_logo;
                this.faviURL = this.url + res['data'].fav_icon;
                this.headURL = this.url + res['data'].header_image;
                this.terms = res['data']['terms'];
                this.privacy = res['data']['privacy'];
                this.selectedCurrency = res['data']['currency'];
                this.selectedLanguage = res['data']['language'];
                this.delivery_fee = res['data']['delivery_fee'] == null ? 0 : res['data']['delivery_fee'];
                this.ordermin = res['data']['order_price'];
                this.common_discount = res['data']['common_discount'];
                this.mindeli = res['data']['delivery_fee_above_min'];
                this.maxdeli = res['data']['delivery_fee_above_max'];
                this.belowmaxdeli = res['data']['delivery_fee_below_max'];
                this.belowmindeli = res['data']['delivery_fee_below_min'];
                this.street = res['data']['street'];
                this.city = res['data']['city'];
                this.state = res['data']['state'];
                this.country = res['data']['country'];
                this.pin = res['data']['pincode'];
                this.mobile = res['data']['mobile'];

            }
        });
    }

    onFileChange(e) {
        if (e.target.files && e.target.files[0]) {
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = (event) => { // called once readAsDataURL is completed
                this.logoURL = event.target.result;
            }
            this.fileListLight.push(e.target.files[0]);

        }
    }

    onFilefaviChange(e) {
        if (e.target.files && e.target.files[0]) {
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = (event) => { // called once readAsDataURL is completed
                this.faviURL = event.target.result;
            }
            this.fileListFav.push(e.target.files[0]);

        }
    }

    onFileheadChange(e) {
        if (e.target.files && e.target.files[0]) {
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = (event) => { // called once readAsDataURL is completed
                this.headURL = event.target.result;
            }
            this.fileListHead.push(e.target.files[0]);

        }
    }

    min0() {
        this.delivery_fee = this.delivery_fee < 0 ? 0 : this.delivery_fee;
      }
}
