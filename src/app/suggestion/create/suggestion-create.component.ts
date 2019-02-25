import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, finalize, debounceTime } from 'rxjs/operators';

import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { SearchService } from '@app/core/http/search/search.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';

import { Suggestion } from '@app/core/models/suggestion.model';
import { Organization } from '@app/core/models/organization.model';

@Component({
	selector: 'app-suggestion',
	templateUrl: './suggestion-create.component.html',
	styleUrls: ['./suggestion-create.component.scss']
})
export class SuggestionCreateComponent implements OnInit {

	suggestion: Suggestion;
	organization: Organization;
	filteredObjects: Observable<any>;
	selectedObject: any;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	isLoading = true;
	imageUrl: any;
	uploader: FileUploader;

	suggestionForm = new FormGroup({
		title: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		parent: new FormControl(''),
		parentType: new FormControl(''),
		imageUrl: new FormControl('', [Validators.required])
	});

	@ViewChild('parentInput') parentInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	constructor(
		private suggestionService: SuggestionService,
		private organizationService: OrganizationService,
		private searchService: SearchService,
		public snackBar: MatSnackBar,
		private route: ActivatedRoute,
		private router: Router,
		private meta: MetaService
	) {
		this.filteredObjects = this.suggestionForm.get('parent').valueChanges
			.pipe(
				debounceTime(300),
				switchMap((search: string) => search ? this.searchService.all({query: search}) : of([]))
			);
	}

	ngOnInit() {
		this.isLoading = true;
		this.meta.updateTags(
			{
				title: 'Create Suggestion',
				description: 'Creating a new suggestion on the NewVote platform.'
			});

		// this.route.paramMap.subscribe(params => {
		// 	const ID = params.get('id');
		// 	if (ID) {
		// 		this.solutionService.view({ id: ID, orgs: [] })
		// 			.pipe(finalize(() => { this.isLoading = false; }))
		// 			.subscribe(solution => {
		// 				if (solution) {
		// 					this.solutions.push(solution);
		// 				}
		// 			});
		// 	} else {
		// 		this.isLoading = false;
		// 	}
		// });

		this.organizationService.get().subscribe(org => this.organization = org);
		this.isLoading = false;
	}

	onSave() {
		this.isLoading = true;
		this.suggestion = <Suggestion>this.suggestionForm.value;
		this.suggestion.organizations = this.organization;
		console.log(this.suggestion);

		this.suggestionService.create({ entity: this.suggestion })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(t => {
				if (t.error) {
					this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
				} else {
					this.openSnackBar('Succesfully created', 'OK');
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

	parentSelected(event: any) {
		const selectedItem = event.option.value;
		// have to make sure the item isn't already in the list
		this.selectedObject = selectedItem;
		this.suggestionForm.get('parent').setValue('');
		this.suggestionForm.get('parentType').setValue(selectedItem.schema);
		this.parentInput.nativeElement.value = '';
	}

	solutionRemoved(solution: any) {
		this.selectedObject = null;
		this.suggestionForm.get('parentType').setValue(null);
	}

	add(event: any) {
		console.log('item added: ', event);
	}

}
