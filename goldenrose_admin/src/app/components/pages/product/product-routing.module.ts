import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductAddComponent } from './product-add/product-add.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { ImportComponent } from './import/import.component';
const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        component: ProductListComponent,
    },
    {
        path: 'list',
        component: ProductListComponent,
    },
    {
        path: 'add',
        component: ProductAddComponent,
    },
    {
        path: 'view/:id',
        component: ProductViewComponent,
    },
    {
        path: 'edit/:id',
        component: ProductEditComponent,
    },
    {
        path: 'uploadfile',
        component: ImportComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProductRoutingModule {}
