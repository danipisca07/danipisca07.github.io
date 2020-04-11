import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import {ServizioService} from "./servizio.service";
import { SummaryPipe } from './summary.pipe';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {HttpClientModule} from "@angular/common/http";
import { LandingComponent } from './landing/landing.component';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    SummaryPipe,
    HeaderComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    HttpClientModule
  ],
  providers: [ServizioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
