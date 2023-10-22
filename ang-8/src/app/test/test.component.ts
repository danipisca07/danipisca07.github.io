import { Component, OnInit } from '@angular/core';
import { ServizioService } from "../servizio.service";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  public string: String;
  public strings: String[];
  public text = "BLA BLA LBABLA BLA LBABLA BLA LBABLA BLA LBABLA BLA LBA";
  constructor(service : ServizioService) {
    this.string = service.getString();
    this.strings = service.getStrings();
  }

  ngOnInit() {
  }

}
