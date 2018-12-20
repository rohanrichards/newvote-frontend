import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { ObservableMedia } from '@angular/flex-layout';
import { Subject, Observable } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AuthenticationService, I18nService } from '@app/core';

import { SearchService } from '@app/core/http/search/search.service';

@Component({
	selector: 'app-shell',
	templateUrl: './shell.component.html',
	styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
	searchInput = new FormControl('', [Validators.required]);
	public searchResults$: Observable<any>;
	private searchTerms = new Subject<string>();


	constructor(private router: Router,
		private titleService: Title,
		private media: ObservableMedia,
		private authenticationService: AuthenticationService,
		private i18nService: I18nService,
		private searchService: SearchService
	) { }

	ngOnInit() {
		this.searchResults$ = this.searchInput.valueChanges
			.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				switchMap(
					(query: string) => {
						console.log('search results: ', this.searchService.all({ query }));
						return this.searchService.all({ query });
					}
				)
			);

		this.searchResults$.subscribe(results => console.log(results));
	}

	search(term: string) {
		console.log('searching: ', term);
		this.searchTerms.next(term);
	}

	setLanguage(language: string) {
		this.i18nService.language = language;
	}

	logout() {
		this.authenticationService.logout()
			.subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
	}

	get username(): string | null {
		const credentials = this.authenticationService.credentials;
		return credentials ? credentials.user.username : null;
	}

	get isAuthenticated(): boolean {
		return this.authenticationService.isAuthenticated();
	}

	get languages(): string[] {
		return this.i18nService.supportedLanguages;
	}

	get isMobile(): boolean {
		return this.media.isActive('xs') || this.media.isActive('sm');
	}

	get title(): string {
		return this.titleService.getTitle();
	}
}
