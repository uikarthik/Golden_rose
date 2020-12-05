import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { validLanguage } from 'src/app/helpers/languages';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.less']
})
export class AboutComponent implements OnInit {

  constructor(private translate:TranslateService) { }

  ngOnInit(): void {
    this.translate.use(validLanguage(localStorage.getItem('locale')));
  }
 
}
