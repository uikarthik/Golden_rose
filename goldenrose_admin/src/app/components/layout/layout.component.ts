import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { validLanguage } from 'src/app/helpers/languages';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.less'],
})
export class LayoutComponent implements OnInit {
    isCollapsed = false;
    language: any;
    constructor(
        private translate: TranslateService, private settings: SettingsService
    ) { }

    ngOnInit(): void {
        this.GetAdminProfile();
        setTimeout(() => {
            if (this.language == "spanish") {
                localStorage.setItem('locale', 'es');
                this.translate.use(validLanguage(localStorage.getItem('locale')));
                document.documentElement.lang = localStorage.getItem('locale');
            }
            else {
                localStorage.setItem('locale', 'en');
                this.translate.use(validLanguage(localStorage.getItem('locale')));
                document.documentElement.lang = localStorage.getItem('locale');
            }
        }, 2000);


    }

    public GetAdminProfile() {
        this.settings.GetSetting().subscribe(res => {
            if (res['success']) {
                this.language = res['data']['language'];
            }
        });
    }
}
