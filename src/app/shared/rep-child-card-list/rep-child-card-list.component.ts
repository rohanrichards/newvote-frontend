import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-rep-child-card-list',
    templateUrl: './rep-child-card-list.component.html',
    styleUrls: ['./rep-child-card-list.component.scss']
})
export class RepChildCardListComponent {
  @Input() items: Array<any>;
  @Input() model: string;
  @Input() path: string;

}
