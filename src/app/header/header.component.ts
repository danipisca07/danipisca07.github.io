import {Component, HostListener, OnInit} from '@angular/core';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(){

  }

  ngOnInit() {
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    let element = document.getElementById('navbar');
    let spaceHolder = document.getElementById('spaceholder');
    if (window.pageYOffset > window.innerHeight) {
      element.classList.add('sticky');
      spaceHolder.classList.add('spaceHolder');
    } else {
      element.classList.remove('sticky');
      spaceHolder.classList.remove('spaceHolder');
    }
  }

}
