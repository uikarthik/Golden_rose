import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouponRoutingModule } from '../coupon/coupon-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { CouponAddComponent } from './coupon-add/coupon-add.component';
import { CouponListComponent } from './coupon-list/coupon-list.component';
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
    declarations: [CouponAddComponent, CouponListComponent],
    imports: [CommonModule, CouponRoutingModule, SharedModule, TranslateModule.forChild({
        loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient],
        },
    }),],
})
export class CouponModule {}
