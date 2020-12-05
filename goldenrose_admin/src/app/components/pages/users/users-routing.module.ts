import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserAddComponent } from './user-add/user-add.component';
import { UserViewComponent } from './user-view/user-view.component';
import { UserEditComponent } from './user-edit/user-edit.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        component: UserListComponent,
    },
    {
        path: 'list',
        component: UserListComponent,
    },
    {
        path: 'add',
        component: UserAddComponent,
    },
    {
        path: 'view/:id',
        component: UserViewComponent,
    },
    {
        path: 'update/:id',
        component: UserAddComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersRoutingModule {}
