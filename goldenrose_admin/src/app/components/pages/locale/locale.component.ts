import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LocaleService } from '../../../services/locale.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-locale',
  templateUrl: './locale.component.html',
  styleUrls: ['./locale.component.less']
})
export class LocaleComponent implements OnInit {

  listOfData = [];
  validateForm: FormGroup;
  isVisible = false;
  isOkLoading = false;
  localeLanguage;
  localeSymbol;
  isEdit = false;
  isCoinVisible = false;
  editid;
  editLoading=false;
  constructor(
    private localeService: LocaleService,
    private nzMessageService: NzMessageService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.GetAllLocale();
    this.FormValidate();
  }

  public GetAllLocale() {
    this.localeService.LocaleGetall().subscribe(res => {
      if (res['success']) {
        this.listOfData = res['data'];
      }
    })
  }

  public FormValidate() {
    this.validateForm = this.fb.group({
      language: [null, [Validators.required]],
      symbol: [null, [Validators.required]]
    });
  }

  cancel(): void {
  }

  confirm(id): void {
    this.localeService.LocaleDelete({ id: id }).subscribe(res => {
      if (res['success']) {
        this.nzMessageService.success(res['message']);
        this.GetAllLocale();
      } else {
        this.nzMessageService.error(res['message']);
      }
    })
  }

  handleCoinCancel(): void {
    this.isCoinVisible = false;
    this.isEdit = false;
    this.editid = '';
    this.localeSymbol = '';
    this.localeLanguage = '';
  }

  showCoinModal(): void {
    this.isCoinVisible = true;
  }

  public EditData(data) {
    this.isEdit = true;
    this.editid = data._id
    this.localeLanguage = data.language;
    this.localeSymbol = data.symbol;
  }

  public EditCoin() {
    let val = {
      id: this.editid,
      symbol: this.validateForm.value.symbol,
      language: this.validateForm.value.language
    }
    this.localeService.LocaleUpdate(val).subscribe(res => {
      if (res['success']) {
        this.isCoinVisible = false;
        this.isEdit = false;
        this.nzMessageService.success(res["message"]);
        this.GetAllLocale();
      }
    });
  }

  submitForm(): void {

    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.status == "VALID" && this.validateForm.touched) {
      this.editLoading = true;
      let val = {
        symbol: this.validateForm.value.symbol,
        language: this.validateForm.value.language
      }
      this.localeService.LocaleCreate(val).subscribe(res => {
        if (res['success']) {
          this.isCoinVisible = false;
          this.nzMessageService.success(res["message"]);
          this.GetAllLocale();
        }
      })
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  EnableLocale(data){
    this.localeService.LocaleStatus(data._id).subscribe(res => {
      if (res['success']) {
        data.status = data.status ? false : true;
        this.nzMessageService.success(res["message"]);
      } else {
        this.nzMessageService.error(res["message"]);
      }
    });
  }
}
