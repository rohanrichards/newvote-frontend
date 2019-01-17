import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { map, startWith, finalize } from 'rxjs/operators';

import { OrganizationService } from '@app/core/http/organization/organization.service';
import { Organization } from '@app/core/models/organization.model';

@Component({
	selector: 'app-organization',
	templateUrl: './organization-create.component.html',
	styleUrls: ['./organization-create.component.scss']
})
export class OrganizationCreateComponent implements OnInit {

	organization: Organization;
	isLoading = true;
	imageUrl: any;
	uploader: FileUploader;
	organizationForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		url: new FormControl('', [Validators.required]),
		imageUrl: new FormControl('', [Validators.required])
	});

	@ViewChild('solutionInput') solutionInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	constructor(
		private organizationService: OrganizationService,
		public snackBar: MatSnackBar,
		private route: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit() {
		this.isLoading = true;

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

		this.organizationService.get().subscribe(org => this.organization = org);
	}

	onFileChange(event: any) {
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			const reader = new FileReader();

			reader.onload = (pe: ProgressEvent) => {
				this.imageUrl = (<FileReader>pe.target).result;
			};

			reader.readAsDataURL(file);
		}
	}

	onSave() {
		this.isLoading = true;
		this.organization = <Organization>this.organizationForm.value;
		console.log('saving: ', this.organization);

		this.uploader.onCompleteAll = () => {
			console.log('completed all');
			this.isLoading = false;
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			if (status === 200 && item.isSuccess) {
				const res = JSON.parse(response);
				this.organization.imageUrl = res.secure_url;

				this.organizationService.create({ entity: this.organization })
					.pipe(finalize(() => { this.isLoading = false; }))
					.subscribe(t => {
						if (t.error) {
							this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
						} else {
							this.openSnackBar('Succesfully created', 'OK');
							this.router.navigate([`/organizations`, { forceUpdate: true }]);
						}
					});
			}
		};

		this.uploader.uploadAll();
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 2000,
			horizontalPosition: 'center'
		});
	}

}
