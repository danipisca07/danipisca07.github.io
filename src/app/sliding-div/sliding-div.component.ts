import {Component, Input, OnInit, Renderer2} from '@angular/core';
import { InViewportModule } from "ng-in-viewport";
import 'intersection-observer'

@Component({
  selector: 'app-sliding-div',
  templateUrl: './sliding-div.component.html',
  styleUrls: ['./sliding-div.component.scss']
})
export class SlidingDivComponent implements OnInit {

  @Input() cssClasses : string;
  @Input() backgroundColor : string;

  constructor(private renderer:Renderer2 ) {
  }

  ngOnInit() {
  }

  isVisible({ target, visible }: { target: Element; visible: boolean }){
    if(visible){
      console.log(this, " entered the viewport");
      this.renderer.addClass(target, 'slide-in');
    }
  }

}
