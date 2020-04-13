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

  @Input() delay = 0;

  constructor(private renderer:Renderer2 ) {
  }

  ngOnInit() {
  }

  async isVisible({target, visible}: { target: Element; visible: boolean }) {
    if (visible) {
      console.log(this, " entered the viewport");
      await this.wait(this.delay);
      this.renderer.addClass(target, 'slideIn');
      this.renderer.removeClass(target, "notYetSlided")
    }
  }

  wait(ms : number){
    return new Promise( resolve => setTimeout(resolve, ms));
  }

}
