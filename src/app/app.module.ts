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
import {HttpClientModule, HttpClient} from "@angular/common/http";
import { LandingComponent } from './landing/landing.component';
import { AboutComponent } from './about/about.component';
import { FooterComponent } from './footer/footer.component';
import { SlidingDivComponent } from './sliding-div/sliding-div.component';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogPostComponent } from './blog/blog-post/blog-post.component';
import { BlogPreviewComponent } from './blog/blog-preview/blog-preview.component';
import {InViewportModule} from "ng-in-viewport";
import {Ng2FittextModule} from "ng2-fittext";
import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { MarkdownModule } from 'ngx-markdown';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    SummaryPipe,
    HeaderComponent,
    LandingComponent,
    AboutComponent,
    FooterComponent,
    SlidingDivComponent,
    BlogListComponent,
    BlogPostComponent,
    BlogPreviewComponent
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
    InViewportModule,
    Ng2FittextModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    TranslateModule.forRoot({
      defaultLanguage: 'it',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [ServizioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
