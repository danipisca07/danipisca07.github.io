import {Component, HostListener, OnInit} from '@angular/core';
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  sanitizer : DomSanitizer;
  translateR: SafeStyle;
  translateL: SafeStyle;

  constructor( private domSanitizer: DomSanitizer) { this.sanitizer = domSanitizer}

  ngOnInit() {
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    const maxDiff = 1500; //Massima lontananza del mouse dal centro dello schermo considerata
    const minDiff = 50; //Minima distanza del mouse dal centro per la visualizzazione dei colori separati
    const maxTrasl = 50; //Massimo spostamento laterale dei due livelli (r e b)


    let b = document.querySelector('#bordi');
    let c = document.querySelector('#colore');
    let xMouse = event.pageX;
    let yMouse = event.pageY;
    let x = window.innerWidth/2;
    let y = window.innerHeight/2;

    let diff = Math.sqrt( Math.pow(x - xMouse,2) + Math.pow(y-yMouse,2) ) - minDiff;
    let trasl = 0;
    if(diff > 0) {
      trasl = diff * maxTrasl / maxDiff;
    }
    if(trasl > maxTrasl){
      trasl = maxTrasl;
    }

    this.translateR = this.sanitizer.bypassSecurityTrustStyle('translateX(+'+trasl+'%)');
    this.translateL = this.sanitizer.bypassSecurityTrustStyle('translateX(-'+trasl+'%)');
  }

  @HostListener('mouseleave', ['$event'])
  onMouseleave(event: MouseEvent) {
    this.translateR = this.sanitizer.bypassSecurityTrustStyle('translateX(0%)');
    this.translateL = this.sanitizer.bypassSecurityTrustStyle('translateX(-0%)');
  }
}
