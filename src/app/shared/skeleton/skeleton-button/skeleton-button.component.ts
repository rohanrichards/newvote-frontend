import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-skeleton-button',
	templateUrl: './skeleton-button.component.html',
	styleUrls: ['./skeleton-button.component.scss']
})
export class SkeletonButtonComponent implements OnInit {

	@Input() width: number;

	constructor() { }

	ngOnInit() {
	}

}
