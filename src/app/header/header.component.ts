import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private translate: TranslateService){ }

  ngOnInit() {
  }

  toggleLang(): void {
    const next = this.translate.currentLang === 'it' ? 'en' : 'it';
    this.translate.use(next);
    localStorage.setItem('lang', next);
  }

  get langLabel(): string {
    return this.translate.currentLang === 'it' ? 'EN' : 'IT';
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e: any) {
    let element = document.getElementById('navbar');
    let spaceHolder = document.getElementById('spaceholder');
    if (window.pageYOffset > window.innerHeight) {
      element?.classList.add('sticky');
      spaceHolder?.classList.add('spaceHolder');
    } else {
      element?.classList.remove('sticky');
      spaceHolder?.classList.remove('spaceHolder');
    }
  }

}
