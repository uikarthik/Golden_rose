import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { LocaleComponent } from './locale/locale.component';
import { LocalesymbolComponent } from './localesymbol/localesymbol.component';
import { ErrorlogComponent } from './errorlog/errorlog.component';
import{ EnvironmetsettingComponent } from './environmetsetting/environmetsetting.component';
import { TypeaddComponent } from './productype/typeadd/typeadd.component';
import { TypelistComponent } from './productype/typelist/typelist.component';
import { UpdateComponent } from './productype/update/update.component';
import { SubtypelistComponent } from './sub-type/subtypelist/subtypelist.component';
import { SubTypeaddComponent } from './sub-type/sub-typeadd/sub-typeadd.component';
import { EditsubtypeComponent } from './sub-type/editsubtype/editsubtype.component';
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { LandingimageComponent } from './landingimage/landingimage.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
    declarations: [DashboardComponent, OrdersComponent,SubTypeaddComponent,EditsubtypeComponent, OrderDetailsComponent,EnvironmetsettingComponent, LocaleComponent, LocalesymbolComponent, ErrorlogComponent, TypeaddComponent, TypelistComponent, UpdateComponent, SubtypelistComponent, LandingimageComponent],
    imports: [
        CommonModule,
        PagesRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        NgApexchartsModule,
        NzSwitchModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
        }),
    ],
})
export class PagesModule {}
