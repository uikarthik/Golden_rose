import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from './report-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportViewComponent } from './report-view/report-view.component';

@NgModule({
    declarations: [ReportListComponent, ReportViewComponent],
    imports: [CommonModule, ReportRoutingModule, SharedModule],
})
export class ReportModule {}
