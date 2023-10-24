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
import { AboutComponent } from './about/about.component';
import { FooterComponent } from './footer/footer.component';
import { SlidingDivComponent } from './sliding-div/sliding-div.component';
import {InViewportModule} from "ng-in-viewport";
import {AngularFittextModule} from "angular-fittext";

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    SummaryPipe,
    HeaderComponent,
    LandingComponent,
    AboutComponent,
    FooterComponent,
    SlidingDivComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    HttpClientModule,
    InViewportModule
  ],
  providers: [ServizioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
