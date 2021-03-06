import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-report-list',
    templateUrl: './report-list.component.html',
    styleUrls: ['./report-list.component.less'],
})
export class ReportListComponent implements OnInit {
    /*----------------------------
    Table -- Recent Orders
    -----------------------------*/
    listOfData = [
        {
            productName: 'Rings',
            totalReports: 121093,
        },
    ];

    constructor() {}

    ngOnInit(): void {}
}
