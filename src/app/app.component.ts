import { Component } from '@angular/core';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'danipisca07-website';

  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer){
    this.loadSocialSvgIcons();
    this.loadPremiumSvgIcons();
  }

  loadSocialSvgIcons(){
    this.matIconRegistry.addSvgIcon(
      'fb',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/021-facebook.svg'))
    this.matIconRegistry.addSvgIcon(
      'instagram',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/025-instagram.svg'))
    this.matIconRegistry.addSvgIcon(
      'telegram',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/029-telegram.svg'))
    this.matIconRegistry.addSvgIcon(
      'whatsapp',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/035-whatsapp.svg'))
    this.matIconRegistry.addSvgIcon(
      'github',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/038-github.svg'))
    this.matIconRegistry.addSvgIcon(
      'twitter',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/043-twitter.svg'))
    this.matIconRegistry.addSvgIcon(
      'linkedin',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/045-linkedin.svg'))
    this.matIconRegistry.addSvgIcon(
      'email',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/051-email.svg'))
  }

  loadPremiumSvgIcons(){
    this.matIconRegistry.addSvgIcon(
      'handshake',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/premium/019-handshake.svg'))
    this.matIconRegistry.addSvgIcon(
      'thinking',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/premium/024-thinking.svg'))
    this.matIconRegistry.addSvgIcon(
      'graduation',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/premium/025-graduation.svg'))
    this.matIconRegistry.addSvgIcon(
      'podium',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/premium/042-podium.svg'))
    this.matIconRegistry.addSvgIcon(
      'medal',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/premium/049-medal-1.svg'))
  }
}
