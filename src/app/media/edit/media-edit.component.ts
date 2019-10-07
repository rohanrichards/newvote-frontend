import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { map, startWith, finalize, debounceTime } from 'rxjs/operators';
import { merge } from 'lodash';

import { IMedia } from '@app/core/models/media.model';
import { IIssue } from '@app/core/models/issue.model';
import { MediaService } from '@app/core/http/media/media.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { Organization } from '@app/core/models/organization.model';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';

@Component({
	selector: 'app-media',
	templateUrl: './media-edit.component.html',
	styleUrls: ['./media-edit.component.scss']
})
export class MediaEditComponent implements OnInit {

	media: IMedia;
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
	usingMetaImage = false;
	mediaForm = new FormGroup({
		url: new FormControl('', [Validators.required]),
		title: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		issues: new FormControl(''),
		image: new FormControl('', [])
	});

	@ViewChild('issueInput', { static: true }) issueInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

	constructor(
		private mediaService: MediaService,
		private issueService: IssueService,
		private organizationService: OrganizationService,
		private route: ActivatedRoute,
		public snackBar: MatSnackBar,
		private router: Router,
		private location: Location,
		private meta: MetaService
	) {
		this.filteredIssues = this.mediaForm.get('issues').valueChanges.pipe(
			startWith(''),
			map((issue: string) => issue ? this._filter(issue) : this.allIssues.slice()));

		this.mediaForm.get('url').valueChanges.pipe(debounceTime(500)).subscribe((url: string) => {
			this.isLoading = true;
			const uri = encodeURIComponent(url).replace(/'/g, '%27').replace(/"/g, '%22');
			this.mediaService.meta({ uri: uri }).subscribe((metadata: any) => {
				this.isLoading = false;
				this.imageUrl = metadata.image;
				this.usingMetaImage = true;
				this.mediaForm.patchValue({
					'title': metadata.title,
					'description': metadata.description
				});

			});
		});
	}

	ngOnInit() {
		this.isLoading = true;
		this.meta.updateTags(
			{
				title: 'Edit Media',
				description: 'Edit media entries for site content.'
			});
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.mediaService.view({ id: ID })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe((media: IMedia) => {
					this.imageUrl = media.image;
					this.media = media;
					for (let i = 0; i < media.issues.length; i++) {
						const issue = media.issues[i];
						this.issues.push(issue);
					}
					this.mediaForm.patchValue(media, { emitEvent: false, onlySelf: true });
					this.imageUrl = media.image;
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
			this.usingMetaImage = false;
		}
	}

	onResetImage() {
		this.newImage = false;
		this.imageUrl = this.mediaForm.get('image').value;
	}

	onSave() {
		this.isLoading = true;
		this.media.organizations = this.organization;

		this.uploader.onCompleteAll = () => {
			this.isLoading = false;
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			if (status === 200 && item.isSuccess) {
				merge(this.media, <IMedia>this.mediaForm.value);
				const res = JSON.parse(response);
				this.media.image = res.secure_url;
				this.updateWithApi();
			}
		};

		if (this.newImage) {
			this.uploader.uploadAll();
		} else {
			merge(this.media, <IMedia>this.mediaForm.value);
			this.updateWithApi();
		}
	}

	updateWithApi() {
		this.media.issues = this.issues;
		this.mediaService.update({ id: this.media._id, entity: this.media })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				if (t.error) {
					this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
				} else {
					this.openSnackBar('Succesfully updated', 'OK');
					this.location.back();
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
			this.mediaForm.get('issues').setValue('');
			this.issueInput.nativeElement.value = '';
		} else {
			this.mediaForm.get('issues').setValue('');
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
