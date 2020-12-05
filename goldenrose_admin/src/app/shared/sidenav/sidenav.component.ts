import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';
import { Constants } from 'src/app/shared/constants/constants';

@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.less'],
})
export class SidenavComponent implements OnInit {
    constructor(private auth: AuthService,private settings: SettingsService) {}
    url = Constants.baseUrl;
    logoImg;

    ngOnInit(): void {
        this.GetAdminProfile();
    }
  
    LogOut() {
        this.auth.logOut();
    }

    public GetAdminProfile() {
        this.settings.GetSetting().subscribe(res => {
            if (res['success']) {
                this.logoImg = res['data']['site_logo'];
                
            }
        });
    }
}
