import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { MatSnackBar } from '@angular/material';
import { merge } from 'lodash';

import { IIssue } from '@app/core/models/issue.model';
import { IssueService } from '@app/core/http/issue/issue.service';

@Component({
	selector: 'app-issue',
	templateUrl: './issue-edit.component.html',
	styleUrls: ['./issue-edit.component.scss']
})
export class IssueEditComponent implements OnInit {

	issue: IIssue;
	isLoading: boolean;
	imageUrl: any;
	imageFile: File;
	newImage = false;
	uploader: FileUploader;
	issueForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		imageUrl: new FormControl('', [Validators.required])
	});

	constructor(
		private issueService: IssueService,
		private route: ActivatedRoute,
		public snackBar: MatSnackBar,
		private router: Router
	) { }

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.issueService.view({ id: ID, orgs: [] })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(issue => {
					this.issueForm.patchValue(issue);
					this.imageUrl = issue.imageUrl;
					this.issue = issue;
				});
		});

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
		this.isLoading = true;

		this.uploader.onCompleteAll = () => {
			console.log('completed all');
			this.isLoading = false;
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			if (status === 200 && item.isSuccess) {
				merge(this.issue, <IIssue>this.issueForm.value);
				const res = JSON.parse(response);
				this.issue.imageUrl = res.secure_url;
				this.updateWithApi();
			}
		};

		if (this.newImage) {
			this.uploader.uploadAll();
		} else {
			merge(this.issue, <IIssue>this.issueForm.value);
			this.updateWithApi();
		}
	}

	updateWithApi() {
		this.issueService.update({ id: this.issue._id, entity: this.issue })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				if (t.error) {
					this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
				} else {
					this.openSnackBar('Succesfully updated', 'OK');
					this.router.navigate(['/issues']);
				}
			});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 2000,
			horizontalPosition: 'center'
		});
	}

}
