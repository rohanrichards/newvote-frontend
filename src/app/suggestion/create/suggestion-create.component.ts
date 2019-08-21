import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of} from 'rxjs';
import { switchMap, startWith, finalize, debounceTime, filter, map, delay } from 'rxjs/operators';

import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { SearchService } from '@app/core/http/search/search.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';

import { Suggestion } from '@app/core/models/suggestion.model';
import { Organization } from '@app/core/models/organization.model';
import { InternalFormsSharedModule } from '@angular/forms/src/directives';

@Component({
	selector: 'app-suggestion',
	templateUrl: './suggestion-create.component.html',
	styleUrls: ['./suggestion-create.component.scss']
})
export class SuggestionCreateComponent implements OnInit, AfterViewInit {

	suggestion: Suggestion;
	organization: Organization;
	filteredObjects: Observable<any>;
	selectedObject: any;
	mediaList: Array<string> = [];
	separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
	isLoading = true;
	createOrEdit = 'create';
	suggestionType: string;

	state$: Observable<object>;

	suggestionForm = new FormGroup({
		title: new FormControl('', [Validators.required]),
		type: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		media: new FormControl(''),
		parent: new FormControl(''),                                         
		parentTitle: new FormControl(''),
		parentType: new FormControl('')
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
	) {
		// this.filteredObjects = this.suggestionForm.get('parent').valueChanges
		// 	.pipe(
		// 		debounceTime(300),
		// 		switchMap((search: string) => search ? this.searchService.all({ query: search }) : of([]))
		// 	);
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

		// if there is a suggestion type
		this.suggestionType = this.route.snapshot.queryParamMap.get('type');

		if (this.suggestionType) {
			this.suggestionForm.patchValue({type: this.suggestionType});
		}

		this.route.paramMap
			.pipe(
				map(() => window.history.state),
				delay(0)
			)
			.subscribe((res) => {
				if (res._id || res.parentTitle || res.type) {
					if (res._id) {
						this.suggestionForm.patchValue({parent: res._id});
					}

					this.suggestionForm.patchValue(res);
					this.suggestionForm.controls['type'].disable();
				} else {
					this.suggestionForm.controls['parentTitle'].disable();
					this.suggestionForm.controls['parentType'].disable();
				}
			});
	}

	ngAfterViewInit() {
		
	}

	onSave() {
		this.isLoading = true;
		this.suggestion = <Suggestion>this.suggestionForm.value;
		this.suggestion.organizations = this.organization;
		this.suggestion.media = this.mediaList;
		// this.suggestion.parent = this.selectedObject;

		this.suggestionService.create({ entity: this.suggestion })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(t => {
				this.openSnackBar('Succesfully created', 'OK');
				this.router.navigate([`/suggestions`], { queryParams: { forceUpdate: true } });
			},
			(error => {
				this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK');
			})
		);
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	parentSelected(event: any) {
		const selectedItem = event.option.value;
		this.selectedObject = selectedItem;
		this.suggestionForm.get('parent').setValue('');
		this.suggestionForm.get('parentType').setValue(selectedItem.schema);
		this.parentInput.nativeElement.value = '';
		this.suggestionForm.patchValue({
			'title': selectedItem.name || selectedItem.title,
			'description': selectedItem.description
		});
	}

	parentRemoved(solution: any) {
		this.selectedObject = null;
		this.suggestionForm.get('parentType').setValue(null);
		this.parentInput.nativeElement.value = '';
		this.suggestionForm.patchValue({
			'title': '',
			'description': ''
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

	resetForm() {
		this.suggestionForm.reset();
		this.createOrEdit = null;
		this.selectedObject = null;
		this.parentInput.nativeElement.value = '';
	}

}
