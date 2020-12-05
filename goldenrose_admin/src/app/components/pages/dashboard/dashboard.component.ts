import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import {
    ApexNonAxisChartSeries,
    ApexAxisChartSeries,
    ApexResponsive,
    ApexChart,
    ApexLegend,
    ApexXAxis,
    ApexYAxis,
    ApexDataLabels,
    ApexTooltip,
    ApexStroke,
} from 'ng-apexcharts';
import { DashboardService } from '../../../services/dashboard.service';

/*------------------------------
Charts
-------------------------------*/
export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    legend: ApexLegend;
};

export type RevenueChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
};

/*------------------------------
Table
-------------------------------*/
interface Person {
    date: string;
    price: number;
    orderID: number;
    status: string;
    orderuser: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less'],
})
export class DashboardComponent implements OnInit {
    /*------------------------------
    Table -- Recent Orders
    -------------------------------*/
    RecentOrder = [];

    /*------------------------------
    Table -- Top Product
    -------------------------------*/
    listOfTopProduct = [
        {
            sno: 1,
            productImg: 'assets/img/product/airpod.jpg',
            productName: 'Apple AirPods Pro',
            productRating: 3,
            price: 130,
            quantity: '120',
        },
    ];

    /*------------------------------
    Table -- Top Search
    -------------------------------*/
    listOfTopSearch = [
        {
            sno: 1,
            searchImg: 'assets/img/product/airpod.jpg',
            productRating: 3,
            price: 130,
            date: 'July 8, 2020',
        },
    ];

    /*------------------------------
    Table -- Top Referrer
    -------------------------------*/
    listOfTopReferrer = [
        {
            sno: 1,
            referrerImg: 'assets/img/product/airpod.jpg',
            username: 'Robin Luntin',
            email: 'robinluntin@gmail.com',
            referrals: 132,
        },
    ];

    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;
    public revenuechartOptions: Partial<RevenueChartOptions>;

    constructor(private dash: DashboardService) {
        /*------------------------------
        Chart -- Statistics Percentage
        -------------------------------*/
        this.chartOptions = {
            series: [],
            chart: {
                type: 'pie',
                fontFamily: 'Spartan, Arial, sans-serif',
            },
            legend: {
                show: false,
            },
            labels: ['Total Order', 'Packed', 'Shipped', 'Delivered', 'Cart'],
        };

        /*------------------------------
        Chart -- Revenue
        -------------------------------*/
        this.revenuechartOptions = {
            series: [
                {
                    name: 'Current Month',
                    data: [],
                },
                {
                    name: 'Previous Month',
                    data: [],
                },
            ],
            chart: {
                height: 380,
                type: 'area',
                fontFamily: 'Spartan, Arial, sans-serif',
                toolbar: {
                    show: false,
                },
            },
            legend: {
                height: 30,
                offsetY: 10,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
            xaxis: {
                type: 'category',
                categories: [
                   
                ],
            },
            yaxis: {
                labels: {
                    show: true,
                    align: 'right',
                    minWidth: 0,
                    maxWidth: 160,
                    style: {
                        fontSize: '12px',
                        fontWeight: 400,
                        cssClass: 'apexcharts-yaxis-label',
                    },
                    offsetX: 0,
                    offsetY: 0,
                    rotate: 0,
                    formatter: (value) => {
                        return '€' + value;
                    },
                },
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yy HH:mm',
                },
            },
        };
    }
    //Dashboard
    productcount: any;
    usercount: any;
    earnings: any = 0;
    ordersCount: any = 0;
    currentMonth_Earnings = 0;
    previousMonth_Earnings = 0;

    //graph
    static_data: any = [];
    order_percentage;
    packed_percentage;
    shipped_percentage;
    delivered_percentage;
    cart_percentage;

    ordered_count = 0;
    packed_count = 0;
    shipped_count = 0;
    delivered_count = 0;
    cart_count = 0;

    ngOnInit(): void {
             this.getPreviousMonth();
        this.getCurrentMonth();
        console.log(this.revenuechartOptions,'dynamic')
 
       
        console.log(this.revenuechartOptions)
         this.getStatics();
        this.getDashAll();
          }

    getDashAll() {
        this.dash.DashboardAll().subscribe((res) => {
            if (res['success']) {
                this.productcount = res['data']['product_count'];
                this.usercount = res['data']['user_count'];
                this.RecentOrder = res['data']['recent_order'];
                this.earnings = res['data']['earnings'][0].amount_paid;
                this.ordersCount = res['data']['order_count'];
            }
        });
    }

    getCurrentMonth() {
        this.dash.CurrentGraph().subscribe((res) => {
            if (res['success']) {
                res['data'].forEach((element,index) => {
                    this.currentMonth_Earnings =
                        this.currentMonth_Earnings + element.amount.amount_paid;
                    this.revenuechartOptions.series[0].data.push(
                        element.amount.amount
                    );
                  });
            }
        });
    }

    getPreviousMonth() {
        this.dash.PreviousGraph().subscribe((res) => {
            if (res['success']) {
                res['data'].forEach((element) => {
                    this.previousMonth_Earnings =
                        this.previousMonth_Earnings + element.amount.amount_paid;
                    this.revenuechartOptions.series[1].data.push(
                        element.amount.amount
                    );
                });
            }
        });
    }

    getStatics() {
        this.dash.Statics().subscribe((res) => {
            if (res['success']) {
                this.static_data = res['data'];
                this.order_percentage = this.static_data.percentage.ordered_percentage;
                this.packed_percentage = this.static_data.percentage.packed_percentage;
                this.shipped_percentage = this.static_data.percentage.shipped_percentage;
                this.delivered_percentage = this.static_data.percentage.delivered_percentage;
                this.cart_percentage = this.static_data.percentage.cart_percentage;

                this.ordered_count = this.static_data.count.ordered_count;
                this.packed_count = this.static_data.count.packed_count;
                this.shipped_count = this.static_data.count.shipped_count;
                this.delivered_count = this.static_data.count.delivered_count;
                this.cart_count = this.static_data.count.cart_count;

                this.chartOptions.series = [
                    this.static_data.count.ordered_count,
                    this.static_data.count.packed_count,
                    this.static_data.count.shipped_count,
                    this.static_data.count.delivered_count,
                    this.static_data.count.cart_count,
                ];
            }
        });
    }
}
