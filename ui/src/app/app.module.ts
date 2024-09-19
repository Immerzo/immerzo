import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module'

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { GoogleChartsModule } from 'angular-google-charts';
import { GoogleChartService } from './google-chart/service/google-chart.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { AnalyticsComponent } from './analytics/analytics.component';
import { AppComponent } from './app.component';
import { BillingBrandComponent } from './billing-brand/billing-brand.component';
import { BillingCreatorComponent } from './billing-creator/billing-creator.component';
import { ChatsBrandComponent } from './chats-brand/chats-brand.component';
import { ChatsCreatorComponent } from './chats-creator/chats-creator.component';
import { CreatorsComponent } from './creators/creators.component';
import { DashBrandComponent } from './dash-brand/dash-brand.component';
import { DashCreatorComponent } from './dash-creator/dash-creator.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { MainComponent } from './main/main.component';
import { ProjectsBrandComponent } from './projects-brand/projects-brand.component';
import { ProjectsCreatorComponent } from './projects-creator/projects-creator.component';
import { ReadProjectComponent } from './read-project/read-project.component';
import { ReadUserComponent } from './read-user/read-user.component';
import { SettingsComponent } from './settings/settings.component';

import { NumberFormatterPipe } from './utils';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AnalyticsComponent,
    AppComponent,
    BillingBrandComponent,
    BillingCreatorComponent,
    ChatsBrandComponent,
    ChatsCreatorComponent,
    CreatorsComponent,
    DashBrandComponent,
    DashCreatorComponent,
    EditUserComponent,
    MainComponent,
    ProjectsBrandComponent,
    ProjectsCreatorComponent,
    ReadProjectComponent,
    ReadUserComponent,
    SettingsComponent,
    NumberFormatterPipe
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    GoogleChartsModule,
    NgxChartsModule,
	HttpClientModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [HttpClient]
    }
    }),
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  entryComponents: [EditUserComponent, ReadProjectComponent, ReadUserComponent],
  providers: [MainComponent, GoogleChartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
