import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-grid-list',
	templateUrl: './grid-list.component.html',
	styleUrls: ['./grid-list.component.scss']
})
export class GridListComponent implements OnInit {

	@Input() path: string;
	@Input() items: Array<any>;

	constructor() { }

	ngOnInit() { }

	delete() {
		// open confirmation dialog
		// determine what service to use
		// delete with API
	}

}
