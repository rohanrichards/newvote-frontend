import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rep-card-child',
  templateUrl: './rep-card-child.component.html',
  styleUrls: ['./rep-card-child.component.scss']
})
export class RepCardChildComponent implements OnInit {
  DEFAULT_IMAGE = 'assets/issue-icon-min.png'
  @Input() item: any;
  @Input() path: any;
  constructor(public router: Router) { }

  ngOnInit() {
  }

  handleClick(event: any) {
    event.preventDefault();
    event.stopPropagation()
  }
}
