import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-rep-card',
    templateUrl: './rep-card.component.html',
    styleUrls: ['./rep-card.component.scss']
})
export class RepCardComponent implements OnInit {
  @Input() path: string;
  @Input() item: any;

  constructor() { }

  ngOnInit() {
  }

}
