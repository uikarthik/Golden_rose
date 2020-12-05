import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { LocaleComponent } from './locale/locale.component';
import { LocalesymbolComponent } from './localesymbol/localesymbol.component';
import { ErrorlogComponent } from './errorlog/errorlog.component';
import { EnvironmetsettingComponent } from './environmetsetting/environmetsetting.component';
import { TypelistComponent } from './productype/typelist/typelist.component';
import { UpdateComponent } from './productype/update/update.component';
import { TypeaddComponent } from './productype/typeadd/typeadd.component';
import { SubtypelistComponent } from './sub-type/subtypelist/subtypelist.component';
import { SubTypeaddComponent } from './sub-type/sub-typeadd/sub-typeadd.component';
import { EditsubtypeComponent } from './sub-type/editsubtype/editsubtype.component';
import { LandingimageComponent } from './landingimage/landingimage.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'orders',
    component: OrdersComponent,
  },
  {
    path: 'details/:id',
    component: OrderDetailsComponent,
  },
  {
    path: 'locale',
    component: LocaleComponent,
  },
  {
    path: 'locale/:id',
    component: LocalesymbolComponent
  },
  {
    path: 'errorlog',
    component: ErrorlogComponent
  },
  {
    path: 'environment',
    component: EnvironmetsettingComponent
  },
  {
    path: 'Type',
    component: TypeaddComponent
  },
  {
    path: 'Typelist',
    component: TypelistComponent
  },
  {
    path: 'update/:id',
    component: UpdateComponent
  },
  {
    path: 'subType',
    component: SubTypeaddComponent
  },
  {
    path: 'subtypeList',
    component: SubtypelistComponent
  },
  {
    path: 'subupdate/:id',
    component: EditsubtypeComponent
  },
  {
    path: 'landingimage',
    component: LandingimageComponent
  },
  {
    path: 'coupon',
    loadChildren: () =>
      import('./coupon/coupon.module').then((mod) => mod.CouponModule),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./users/users.module').then((mod) => mod.UsersModule),
  },
  {
    path: 'product',
    loadChildren: () =>
      import('./product/product.module').then((mod) => mod.ProductModule),
  },
  {
    path: 'category',
    loadChildren: () =>
      import('./category/category.module').then(
        (mod) => mod.CategoryModule
      ),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.module').then(
        (mod) => mod.SettingsModule
      ),
  },
  {
    path: 'notification',
    loadChildren: () =>
      import('./notification/notification.module').then(
        (mod) => mod.NotificationModule
      ),
  },
  {
    path: 'report',
    loadChildren: () =>
      import('./report/report.module').then((mod) => mod.ReportModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
