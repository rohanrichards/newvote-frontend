import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { QuoteService } from './quote.service';

import {OrganizationService } from '@app/core';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	quote: string;
	isLoading: boolean;
	org: any;

	constructor(private quoteService: QuoteService,
		private organizationService: OrganizationService) { }

	ngOnInit() {
		this.organizationService.get().subscribe((org) => this.org = org);
	}

}
