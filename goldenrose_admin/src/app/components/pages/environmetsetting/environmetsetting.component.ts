import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-environmetsetting',
  templateUrl: './environmetsetting.component.html',
  styleUrls: ['./environmetsetting.component.less']
})
export class EnvironmetsettingComponent implements OnInit {
  id;
  isEdit = false;
  validateForm: FormGroup;
  listOfData = [];
  isVisible = false;
  isOkLoading = false;
  FAQWord;
  FAQKey;
  modeValue;

  constructor(
    private siteSettingsService:SettingsService,
    private router: ActivatedRoute,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.id = this.router.snapshot.paramMap.get("id");
  }

  ngOnInit(): void {
    this.GetENV();
    this.FormValidate();
  }

  public FormValidate() {
    this.validateForm = this.fb.group({
      key: [null, [Validators.required]],
      word: [null, [Validators.required]]
    });
  }

  public GetENV() {
    this.siteSettingsService.GetENV().subscribe(res => {
      if (res['success']) {
        this.listOfData = (res['data']).reverse();
        this.modeValue = res['mode'] == 'production' ? true : false;
      } else {
        this.message.error(res['message']);
      }
    })
  }

  public UpdateENV() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.status == "VALID" && this.validateForm.touched) {
      this.isOkLoading = true;
      let val = {
        key: this.validateForm.value.key,
        word: this.validateForm.value.word
      }
      this.siteSettingsService.UpdateENV(val).subscribe(res => {
        if (res['success']) {
          this.isOkLoading = false;
          this.isEdit = false;
          this.message.success(res['message']);
          this.isVisible = false;
          this.GetENV();
        } else {
          this.message.error(res['message']);
        }
      });
    }
  }

  RestartServer() {
    this.siteSettingsService.RestartServer().subscribe(res => {
      if (res['success']) {
        this.message.success(res['message']);
      } else {
        this.message.error(res['message']);
      }
    });
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  public EditData(data) {
    this.isEdit = true;
    this.FAQWord = data.word
    this.FAQKey = data.key;
  }

  GetModeValue() {
    this.siteSettingsService.ChangeENV({ mode: this.modeValue ? 'production' : 'development' }).subscribe(res => {
      if (res['success']) {
        this.message.success(res['message']);
        this.GetENV();
      } else {
        this.message.error(res['message']);
      }
    })
  }

}
