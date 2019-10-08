import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import {ServizioService} from "./servizio.service";
import { SummaryPipe } from './summary.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    SummaryPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [ServizioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
