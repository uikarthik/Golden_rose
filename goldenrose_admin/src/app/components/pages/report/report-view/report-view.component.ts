import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-report-view',
    templateUrl: './report-view.component.html',
    styleUrls: ['./report-view.component.less'],
})
export class ReportViewComponent implements OnInit {
    /*----------------------------
    Table -- Recent Orders
    -----------------------------*/
    listOfData = [
        {
            date: 'July 8, 2020',
            userName: 'Robin Sharma',
            comment: 'this is a sample comment',
        },
    ];
    constructor() {}

    ngOnInit(): void {}
}
