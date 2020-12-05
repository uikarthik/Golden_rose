import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NgOtpInputModule } from 'ng-otp-input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
//Components
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ReactiveFormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [HeaderComponent, FooterComponent, SidenavComponent],
    imports: [
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
        }),
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NzLayoutModule,
        NzIconModule,
        NzDropDownModule,
        NzDividerModule,
        NzDrawerModule,
        NzButtonModule,
        NzFormModule,
        NzInputModule,
        NzCascaderModule,
        NzCheckboxModule,
        NgOtpInputModule,
        NzAvatarModule,
        NzCardModule,
        NzStatisticModule,
        NzTableModule,
        NzTagModule,
        NzTabsModule,
        NzRateModule,
        NzBreadCrumbModule,
        NzStepsModule,
        NzDescriptionsModule,
        NzSelectModule,
        NzUploadModule,
        NzModalModule,
        NzPopconfirmModule,
        NzDatePickerModule,
    ],
    exports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NzLayoutModule,
        NzIconModule,
        NzDropDownModule,
        NzDividerModule,
        NzDrawerModule,
        NzButtonModule,
        NzFormModule,
        NzInputModule,
        NzCascaderModule,
        NzCheckboxModule,
        NgOtpInputModule,
        HeaderComponent,
        FooterComponent,
        SidenavComponent,
        NzAvatarModule,
        NzStatisticModule,
        NzCardModule,
        NzTableModule,
        NzTagModule,
        NzTabsModule,
        NzRateModule,
        NzBreadCrumbModule,
        NzStepsModule,
        NzDescriptionsModule,
        NzSelectModule,
        NzUploadModule,
        NzModalModule,
        NzPopconfirmModule,
        NzDatePickerModule,
    ],
})
export class SharedModule {}
