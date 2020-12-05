import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificationAddComponent } from './notification-add/notification-add.component';
import { NotificationListComponent } from './notification-list/notification-list.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        component: NotificationListComponent,
    },
    {
        path: 'list',
        component: NotificationListComponent,
    },
    {
        path: 'add',
        component: NotificationAddComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class NotificationRoutingModule {}
