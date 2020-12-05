import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CouponAddComponent } from './coupon-add/coupon-add.component';
import { CouponListComponent } from './coupon-list/coupon-list.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        component: CouponListComponent,
    },
    {
        path: 'list',
        component: CouponListComponent,
    },
    {
        path: 'add',
        component: CouponAddComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CouponRoutingModule {}
