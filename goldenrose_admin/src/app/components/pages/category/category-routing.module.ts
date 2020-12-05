import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryAddComponent } from './category-add/category-add.component';
import { CategoryEditComponent } from './category-edit/category-edit.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        component: CategoryListComponent,
    },
    {
        path: 'list',
        component: CategoryListComponent,
    },
    {
        path: 'add',
        component: CategoryAddComponent,
    },
    {
        path: 'edit/:id',
        component: CategoryEditComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CategoryRoutingModule {}
