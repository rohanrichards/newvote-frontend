import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { map, startWith, finalize } from 'rxjs/operators';
import { merge, cloneDeep } from 'lodash';

import { IIssue, Issue } from '@app/core/models/issue.model';
import { ITopic } from '@app/core/models/topic.model';
import { IssueService } from '@app/core/http/issue/issue.service';
import { TopicService } from '@app/core/http/topic/topic.service';
import { Organization } from '@app/core/models/organization.model';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';
import { IssueQuery } from '@app/core/http/issue/issue.query';
import { AppState } from '@app/core/models/state.model';
import { StateService } from '@app/core/http/state/state.service';

@Component({
	selector: 'app-issue',
	templateUrl: './issue-edit.component.html',
	styleUrls: ['./issue-edit.component.scss']
})
export class IssueEditComponent implements OnInit {

	issue: IIssue;
	organization: Organization;
	allTopics: Array<ITopic> = [];
	topics: Array<ITopic> = [];
	filteredTopics: Observable<ITopic[]>;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	isLoading: boolean;
	imageUrl: any;
	imageFile: File;
	newImage = false;
	uploader: FileUploader;
	issueForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		topics: new FormControl(''),
		imageUrl: new FormControl('', [Validators.required])
	});

	@ViewChild('topicInput', { static: true }) topicInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

	constructor(
		private issueService: IssueService,
		private topicService: TopicService,
		private organizationService: OrganizationService,
		private route: ActivatedRoute,
		public snackBar: MatSnackBar,
		private router: Router,
		private meta: MetaService,
		private issueQuery: IssueQuery,
		private stateService: StateService
	) {
		this.filteredTopics = this.issueForm.get('topics').valueChanges.pipe(
			startWith(''),
			map((topic: string) => topic ? this._filter(topic) : this.allTopics.slice()));
	}

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.subscribeToIssueStore(ID);
			this.issueService.view({ id: ID, orgs: [] })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(
					(res) => res,
					(err) => err
				);
		});

		this.topicService.list({})
			.subscribe(topics => this.allTopics = topics);

		this.organizationService.get().subscribe(org => this.organization = org);

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
	}

	subscribeToIssueStore(id: string) {
		this.issueQuery.selectEntity(id)
			.subscribe((issue: Issue) => {
				if (!issue) return false;
				this.updateForm(issue);
			})
	}

	updateForm(issue: Issue) {
		this.imageUrl = issue.imageUrl;
		this.issue = issue;
		for (let i = 0; i < issue.topics.length; i++) {
			const topic = issue.topics[i];
			this.topics.push(topic);
		}
		this.issueForm.setValue({
			'name': issue.name,
			'description': issue.description,
			'imageUrl': issue.imageUrl,
			'topics': ''
		});

		this.meta.updateTags(
			{
				title: `Edit ${issue.name}`,
				appBarTitle: 'Edit Issue',
				description: issue.description
			});
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
		this.imageUrl = this.issueForm.get('imageUrl').value;
	}

	onSave() {
		const issue = cloneDeep(this.issue);
		this.isLoading = true;
		issue.organizations = this.organization;

		this.uploader.onCompleteAll = () => {
			this.isLoading = false;
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			if (status === 200 && item.isSuccess) {
				merge(issue, <IIssue>this.issueForm.value);
				const res = JSON.parse(response);
				issue.imageUrl = res.secure_url;
				this.updateWithApi(issue);
			}
		};

		if (this.newImage) {
			this.uploader.uploadAll();
		} else {
			merge(issue, <IIssue>this.issueForm.value);
			this.updateWithApi(issue);
		}
	}

	updateWithApi(issue: any) {
		issue.topics = this.topics;
		this.issueService.update({ id: issue._id, entity: issue })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe(
				(t) => {
					this.stateService.setLoadingState(AppState.loading);
					this.openSnackBar('Succesfully updated', 'OK');
					this.router.navigate([`/issues/${t._id}`]);
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

	topicSelected(event: any) {
		const selectedItem = event.option.value;

		if (!this.topics.some(topic => topic._id === selectedItem._id)) {
			this.topics.push(event.option.value);
			this.issueForm.get('topics').setValue('');
			this.topicInput.nativeElement.value = '';
		} else {
			this.issueForm.get('topics').setValue('');
			this.topicInput.nativeElement.value = '';
		}
	}

	topicRemoved(topic: any) {
		const index = this.topics.indexOf(topic);

		if (index >= 0) {
			this.topics.splice(index, 1);
		}
	}

	add(event: any) {
	}

	private _filter(value: any): ITopic[] {
		const filterValue = value.name ? value.name.toLowerCase() : value.toLowerCase();

		const filterVal = this.allTopics.filter(topic => {
			const name = topic.name.toLowerCase();
			const compare = name.indexOf(filterValue) !== -1;
			return compare;
		});
		return filterVal;
	}

}
