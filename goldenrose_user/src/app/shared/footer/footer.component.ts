import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PageScrollService, EasingLogic } from 'ngx-page-scroll-core';
import { TranslateService } from '@ngx-translate/core';
import { validLanguage } from 'src/app/helpers/languages';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.less'],
})

export class FooterComponent implements OnInit {
    currentYear = new Date().getFullYear();

    constructor(private router: Router, private pageScrollService: PageScrollService,
        @Inject(DOCUMENT) private document: any, private translate: TranslateService) { }

    public myEasing: EasingLogic = (
        t: number,
        b: number,
        c: number,
        d: number
    ): number => {
        // easeInOutExpo easing
        if (t === 0) {
            return b;
        }
        if (t === d) {
            return b + c;
        }
        if ((t /= d / 2) < 1) {
            return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
        }

        return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
    };

    doSmth(reachedTarget: boolean): void {
        if (reachedTarget) {
            // console.log('Yeah, we reached our destination');
        } else {
            // console.log('Ohoh, something interrupted us');
        }
    }

    ngOnInit(): void {
        this.translate.use(validLanguage(localStorage.getItem('locale')));

        // ngx scroll
        this.pageScrollService.scroll({
            document: this.document,
            scrollTarget: '.theEnd',
        });

        // Scroll to page top of router!!
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0)
        });
    }
}
