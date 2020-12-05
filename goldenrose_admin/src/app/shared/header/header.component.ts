import { Component, OnInit } from '@angular/core';
import { AuthService } from "src/app/services/auth.service";


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
})
export class HeaderComponent implements OnInit {
    // Collapse
    isCollapsed = false;

    // Drawer
    visible = false;

    open(): void {
        this.visible = true;
    }

    close(): void {
        this.visible = false;
    }

email = localStorage.getItem('userEmail');
username = localStorage.getItem('userName')


    constructor(private auth: AuthService) {}

    ngOnInit(): void {}
    LogOut(){
        this.auth.logOut();
    }
}
