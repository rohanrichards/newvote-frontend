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
import { OrganizationQuery } from '@app/core/http/organization/organization.query';
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query';

import { cloneDeep } from 'lodash';

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
		private meta: MetaService,
		private organizationQuery: OrganizationQuery,
		private suggestionQuery: SuggestionQuery
	) { }

	ngOnInit() {
		this.subscribeToOrganizationStore();
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.subscribeToSuggestionStore(ID);
			this.suggestionService.view({ id: ID })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(
					(res) => res,
					(err) => err
				);
		});
	}

	subscribeToSuggestionStore(id: string) {
		this.suggestionQuery.selectEntity(id)
			.subscribe(
				(suggestion) => {
					this.suggestion = suggestion
					this.updateForm(suggestion);
					this.updateTags(suggestion);
				},
				(err) => err
			)
	}

	subscribeToOrganizationStore() {
		this.organizationQuery.select()
			.subscribe(
				(organization: Organization) => this.organization = organization,
				(err) => err
			)
	}

	updateForm(suggestion: Suggestion) {
		this.mediaList = suggestion.media;

		this.suggestionForm.patchValue({
			'title': suggestion.title,
			'type': suggestion.type || '',
			'description': suggestion.description,
			'parent': suggestion.parent,
			'parentTitle': suggestion.parentTitle,
			'parentType': suggestion.parentType
		});
	}

	updateTags(suggestion: Suggestion) {
		this.meta.updateTags(
			{
				title: `Edit ${suggestion.title}`,
				appBarTitle: 'Edit Suggestion',
				description: `${suggestion.description}`
			});
	}

	onSave() {
		this.isLoading = true;

		let suggestion = cloneDeep(this.suggestion);
		merge(suggestion, <Suggestion>this.suggestionForm.value);
		suggestion.organizations = this.organization;
		suggestion.media = this.mediaList;

		this.suggestionService.update({ id: suggestion._id, entity: suggestion })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(
				(t) => {
					this.openSnackBar('Succesfully updated', 'OK');
					this.router.navigate([`/suggestions`]);
				},
				(error) => this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')

			);
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
