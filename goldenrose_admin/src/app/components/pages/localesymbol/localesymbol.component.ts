import { Component, OnInit } from '@angular/core';
import { LocaleService } from '../../../services/locale.service';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-localesymbol',
  templateUrl: './localesymbol.component.html',
  styleUrls: ['./localesymbol.component.less']
})
export class LocalesymbolComponent implements OnInit {

  id;
  isEdit= false;
  editLoading=false;
  validateForm: FormGroup;
  listOfData = [];
  isVisible = false;
  isOkLoading = false;
  FAQWord;
  FAQKey;

  constructor(
    private localeService: LocaleService,
    private router: ActivatedRoute,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.id = this.router.snapshot.paramMap.get("id");
  }

  ngOnInit(): void {
    this.GetLocaleJSON();
    this.FormValidate();
  }

  public FormValidate() {
    this.validateForm = this.fb.group({
      key: [null, [Validators.required]],
      word: [null, [Validators.required]]
    });
  }

  public GetLocaleJSON() {
    this.localeService.LocaleGetFile(this.id).subscribe(res => {
      if (res['success']) {
        this.listOfData = (res['data']).reverse();
      } else {
        this.message.error(res['message']);
      }
    })
  }

  public LocaleAddKey() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.status == "VALID" && this.validateForm.touched) {
      this.isOkLoading = true;
      let val = {
        key: this.validateForm.value.key,
        symbol: this.id,
        word: this.validateForm.value.word
      }
      this.localeService.LocaleAddKey(val).subscribe(res => {
        if (res['success']) {
          this.isOkLoading = false;
          this.isEdit= false;
          this.message.success(res['message']);
          this.isVisible = false;
          this.GetLocaleJSON();
        } else {
          this.message.error(res['message']);
        }
      })
    }
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset();
  }

  public EditData(data) {
    this.isEdit = true;
    this.FAQWord = data.word
    this.FAQKey = data.key;
  }

}
