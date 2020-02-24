import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-rep-card-child',
  templateUrl: './rep-card-child.component.html',
  styleUrls: ['./rep-card-child.component.scss']
})
export class RepCardChildComponent implements OnInit {
  DEFAULT_IMAGE = 'assets/logo-no-text.png'
  @Input() item: any;

  constructor() { }

  ngOnInit() {
  }

}
