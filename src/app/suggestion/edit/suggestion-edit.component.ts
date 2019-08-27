import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, finalize, debounceTime } from 'rxjs/operators';
import { merge } from 'lodash';

import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { SearchService } from '@app/core/http/search/search.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';

import { Suggestion } from '@app/core/models/suggestion.model';
import { Organization } from '@app/core/models/organization.model';

@Component({
	selector: 'app-suggestion',
	templateUrl: './suggestion-edit.component.html',
	styleUrls: ['./suggestion-edit.component.scss']
})
export class SuggestionEditComponent implements OnInit {

	suggestion: Suggestion;
	organization: Organization;
	mediaList: Array<string> = [];
	separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
	isLoading = true;

	suggestionForm = new FormGroup({
		title: new FormControl('', [Validators.required]),
		type: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		statements: new FormControl(''),
		media: new FormControl(''),
		parent: new FormControl(''),
		parentType: new FormControl(''),
		parentTitle: new FormControl('')
	});

	@ViewChild('parentInput') parentInput: ElementRef<HTMLInputElement>;
	@ViewChild('mediaInput') mediaInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	constructor(
		private suggestionService: SuggestionService,
		private organizationService: OrganizationService,
		private searchService: SearchService,
		private location: Location,
		public snackBar: MatSnackBar,
		private route: ActivatedRoute,
		private router: Router,
		private meta: MetaService
	) { }

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.suggestionService.view({ id: ID })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(suggestion => {

					if (suggestion.parentType === 'Proposal') {
						suggestion.parentType = 'Action'
					}

					this.suggestion = suggestion;
					this.mediaList = suggestion.media;

					this.suggestionForm.patchValue({
						'title': suggestion.title,
						'type': suggestion.type || '',
						'description': suggestion.description,
						'parent': suggestion.parent,
						'parentTitle': suggestion.parentTitle,
						'parentType': suggestion.parentType
					});

					this.meta.updateTags(
						{
							title: `Edit ${suggestion.title}`,
							appBarTitle: 'Edit Suggestion',
							description: `${suggestion.description}`
						});
				});
		});

		this.organizationService.get().subscribe(org => this.organization = org);
	}

	onSave() {
		this.isLoading = true;
		merge(this.suggestion, <Suggestion>this.suggestionForm.value);
		this.suggestion.organizations = this.organization;
		this.suggestion.media = this.mediaList;

		if (this.suggestion.parentType === 'Action') {
			this.suggestion.parentType = 'Proposal';
		}

		this.suggestionService.update({ id: this.suggestion._id, entity: this.suggestion })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				if (t.error) {
					this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
				} else {
					this.openSnackBar('Succesfully updated', 'OK');
					this.router.navigate([`/suggestions`], { queryParams: { forceUpdate: true } });
				}
			});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	mediaAdded(event: any) {
		if (event.value) {
			this.mediaList.push(event.value);
			this.mediaInput.nativeElement.value = '';
		}
	}

	mediaRemoved(media: any) {
		const index = this.mediaList.indexOf(media);
		if (index > -1) {
			this.mediaList.splice(index, 1);
		}
	}

}
