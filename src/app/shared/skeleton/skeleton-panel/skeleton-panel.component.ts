import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-panel',
  templateUrl: './skeleton-panel.component.html',
  styleUrls: ['./skeleton-panel.component.scss']
})
export class SkeletonPanelComponent implements OnInit {

  @Input() hasChip: boolean;
  @Input() hasVote: boolean;

  constructor() { }

  ngOnInit() {
  }

}
