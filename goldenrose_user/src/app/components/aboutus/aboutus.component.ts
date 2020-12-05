import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { validLanguage } from 'src/app/helpers/languages';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.less']
})
export class AboutusComponent implements OnInit {

  constructor(private translate: TranslateService) {

  }

  ngOnInit(): void {
    this.translate.use(validLanguage(localStorage.getItem('locale')));
  }
 

  
}
