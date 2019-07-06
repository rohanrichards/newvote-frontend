import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-skeleton-text-bar',
	templateUrl: './skeleton-text-bar.component.html',
	styleUrls: ['./skeleton-text-bar.component.scss']
})
export class SkeletonTextBarComponent implements OnInit {

	@Input() isHeading: boolean;
	@Input() isSubtitle: boolean;
	@Input() isText: boolean;
	@Input() width: number;

	constructor() { }

	ngOnInit() {
	}

}
