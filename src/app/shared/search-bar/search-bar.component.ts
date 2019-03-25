import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material';
import { Subject, Observable, of } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SearchService } from '@app/core/http/search/search.service';

@Component({
	selector: 'app-search-bar',
	templateUrl: './search-bar.component.html',
	styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

	@ViewChild('searchInputElement') searchInputElement: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	searchInputControl = new FormControl('', [Validators.required]);
	public searchResults$: Observable<any>;
	private searchTerms = new Subject<string>();

	constructor(
		private searchService: SearchService
	) { }

	ngOnInit() {
		this.searchResults$ = this.searchInputControl.valueChanges
			.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				switchMap(
					(query: string) => {
						if (query !== '') {
							console.log('search results: ', this.searchService.all({ query }));
							return this.searchService.all({ query });
						} else {
							return of([]);
						}
					}
				)
			);

		this.searchResults$.subscribe(results => console.log(results));
	}

	search(term: string) {
		console.log('searching: ', term);
		this.searchTerms.next(term);
	}

	searchSelected(event: any) {
		console.log('search selected: ', event);

		const item = event.option.value;
		const model = item.schema;
		const url = `/${model.toLowerCase()}s/${item._id}`;

		this.searchInputControl.setValue('');
		console.log('routing to: ', url);
	}

}
