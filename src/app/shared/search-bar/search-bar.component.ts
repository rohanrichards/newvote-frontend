import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material';
import { Observable, of } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SearchService } from '@app/core/http/search/search.service';

@Component({
	selector: 'app-search-bar',
	templateUrl: './search-bar.component.html',
	styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
	@Input() isVisible = false;
	@Output() isVisibleChange = new EventEmitter<boolean>();

	@ViewChild('searchInputElement') searchInputElement: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	searchInputControl = new FormControl('', []);
	public searchResults$: Observable<any>;

	constructor(
		private searchService: SearchService,
		private router: Router
	) { }

	ngOnInit() {
		this.searchResults$ = this.searchInputControl.valueChanges
			.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				switchMap(
					(query: string) => {
						if (query !== '') {
							return this.searchService.all({ query });
						} else {
							return of([]);
						}
					}
				)
			);
	}

	searchSelected(event: any) {
		console.log('search selected: ', event);

		const item = event.option.value;
		const model = item.schema;
		const url = `/${model.toLowerCase()}s/${item._id}`;

		this.searchInputControl.setValue('');
		this.isVisible = false;
		this.isVisibleChange.emit(false);
		this.router.navigate([url]);
		console.log(this);
	}

}
