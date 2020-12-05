import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileSettingComponent } from './profile-setting/profile-setting.component';
import { SiteSettingComponent } from './site-setting/site-setting.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'profile',
        component: ProfileSettingComponent,
    },
    {
        path: 'profile',
        component: ProfileSettingComponent,
    },
    {
        path: 'site',
        component: SiteSettingComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettingsRoutingModule {}
