import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServizioService {

  constructor() { }

  public getString() : string{
    return "But";
  }

  public getStrings(){
    return [ "We", "are", "still", "working", "on", "it" ];
  }
}
