import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Immerzo';

  constructor(private translate: TranslateService) {
    // Set the default language.
    translate.setDefaultLang('en-US');

    // Set the language to use.
    translate.use('en-US');
  }
}

