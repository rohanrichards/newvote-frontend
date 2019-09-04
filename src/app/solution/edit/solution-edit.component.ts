import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { map, startWith, finalize } from 'rxjs/operators';
import { merge } from 'lodash';

import { ISolution } from '@app/core/models/solution.model';
import { IIssue } from '@app/core/models/issue.model';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { Organization } from '@app/core/models/organization.model';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';

@Component({
	selector: 'app-solution',
	templateUrl: './solution-edit.component.html',
	styleUrls: ['./solution-edit.component.scss']
})
export class SolutionEditComponent implements OnInit {

	solution: ISolution;
	allIssues: Array<IIssue> = [];
	issues: Array<IIssue> = [];
	organization: Organization;
	filteredIssues: Observable<IIssue[]>;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	isLoading: boolean;
	imageUrl: any;
	imageFile: File;
	newImage = false;
	uploader: FileUploader;
	solutionForm = new FormGroup({
		title: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		issues: new FormControl(''),
		imageUrl: new FormControl('', [Validators.required])
	});

	@ViewChild('issueInput') issueInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	constructor(
		private solutionService: SolutionService,
		private issueService: IssueService,
		private organizationService: OrganizationService,
		private route: ActivatedRoute,
		public snackBar: MatSnackBar,
		private router: Router,
		private meta: MetaService
	) {
		this.filteredIssues = this.solutionForm.get('issues').valueChanges.pipe(
			startWith(''),
			map((issue: string) => issue ? this._filter(issue) : this.allIssues.slice()));
	}

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.solutionService.view({ id: ID, orgs: [] })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(solution => {
					this.imageUrl = solution.imageUrl;
					this.solution = solution;
					for (let i = 0; i < solution.issues.length; i++) {
						const issue = solution.issues[i];
						this.issues.push(issue);
					}
					this.solutionForm.setValue({
						'title': solution.title,
						'description': solution.description,
						'imageUrl': solution.imageUrl,
						'issues': ''
					});
					this.meta.updateTags(
						{
							title: `Edit ${solution.title}`,
							appBarTitle: 'Edit Solution',
							description: solution.description,
							image: solution.imageUrl
						});
				});
		});

		// set up the file uploader
		const uploaderOptions: FileUploaderOptions = {
			url: `https://api.cloudinary.com/v1_1/newvote/upload`,
			// Upload files automatically upon addition to upload queue
			autoUpload: false,
			// Use xhrTransport in favor of iframeTransport
			isHTML5: true,
			// Calculate progress independently for each uploaded file
			removeAfterUpload: true,
			// XHR request headers
			headers: [
				{
					name: 'X-Requested-With',
					value: 'XMLHttpRequest'
				}
			]
		};

		this.uploader = new FileUploader(uploaderOptions);

		this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
			// Add Cloudinary's unsigned upload preset to the upload form
			form.append('upload_preset', 'qhf7z3qa');
			// Add file to upload
			form.append('file', fileItem);

			// Use default "withCredentials" value for CORS requests
			fileItem.withCredentials = false;
			return { fileItem, form };
		};

		this.issueService.list({})
			.subscribe(issues => this.allIssues = issues);

		this.organizationService.get().subscribe(org => this.organization = org);
	}

	onFileChange(event: any) {
		this.newImage = true;
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			const reader = new FileReader();

			this.imageFile = file;

			reader.onload = (pe: ProgressEvent) => {
				this.imageUrl = (<FileReader>pe.target).result;
			};

			reader.readAsDataURL(file);
		}
	}

	onResetImage() {
		this.newImage = false;
		this.imageUrl = this.solutionForm.get('imageUrl').value;
	}

	onSave() {
		this.isLoading = true;
		this.solution.organizations = this.organization;

		this.uploader.onCompleteAll = () => {
			this.isLoading = false;
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			if (status === 200 && item.isSuccess) {
				merge(this.solution, <ISolution>this.solutionForm.value);
				const res = JSON.parse(response);
				this.solution.imageUrl = res.secure_url;
				this.updateWithApi();
			}
		};

		if (this.newImage) {
			this.uploader.uploadAll();
		} else {
			merge(this.solution, <ISolution>this.solutionForm.value);
			this.updateWithApi();
		}
	}

	updateWithApi() {
		this.solution.issues = this.issues;
		this.solutionService.update({ id: this.solution._id, entity: this.solution })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				if (t.error) {
					this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
				} else {
					this.openSnackBar('Succesfully updated', 'OK');
					this.router.navigate([`/solutions/${t._id}`], { queryParams: { forceUpdate: true } });
				}
			});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	issueSelected(event: any) {
		const selectedItem = event.option.value;
		// have to make sure the item isn't already in the list
		if (!this.issues.some(issue => issue._id === selectedItem._id)) {
			this.issues.push(event.option.value);
			this.solutionForm.get('issues').setValue('');
			this.issueInput.nativeElement.value = '';
		} else {
			this.solutionForm.get('issues').setValue('');
			this.issueInput.nativeElement.value = '';
		}
	}

	issueRemoved(issue: any) {
		const index = this.issues.indexOf(issue);

		if (index >= 0) {
			this.issues.splice(index, 1);
		}
	}

	add(event: any) {
	}

	private _filter(value: any): IIssue[] {
		const filterValue = value.name ? value.name.toLowerCase() : value.toLowerCase();

		const filterVal = this.allIssues.filter(issue => {
			const name = issue.name.toLowerCase();
			const compare = name.indexOf(filterValue) !== -1;
			return compare;
		});
		return filterVal;
	}

}
