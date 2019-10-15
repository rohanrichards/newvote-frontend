import { Component, OnInit, Input } from '@angular/core'

@Component({
    selector: 'app-skeleton-header',
    templateUrl: './skeleton-header.component.html',
    styleUrls: ['./skeleton-header.component.scss']
})
export class SkeletonHeaderComponent implements OnInit {

	@Input() noLogo: boolean;
	constructor() { }

	ngOnInit() {
	}

}
