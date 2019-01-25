import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { map, startWith, finalize } from 'rxjs/operators';
import { merge } from 'lodash';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { UserService } from '@app/core/http/user/user.service';
import { Organization } from '@app/core/models/organization.model';
import { User } from '@app/core/models/user.model';

@Component({
	selector: 'app-organization',
	templateUrl: './organization-edit.component.html',
	styleUrls: ['./organization-edit.component.scss']
})
export class OrganizationEditComponent implements OnInit {

	organization: Organization;
	allUsers: Array<User> = [];
	owner: User;
	filteredUsers: Observable<User[]>;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	isLoading: boolean;
	imageUrl: any;
	imageFile: File;
	newImage = false;
	uploader: FileUploader;
	organizationForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		url: new FormControl('', [Validators.required]),
		imageUrl: new FormControl('', [Validators.required]),
		owner: new FormControl('')
	});

	@ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	constructor(
		private userService: UserService,
		private organizationService: OrganizationService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		public snackBar: MatSnackBar,
		private router: Router
	) {
		this.filteredUsers = this.organizationForm.get('owner').valueChanges.pipe(
			startWith(''),
			map((issue: string) => issue ? this._filter(issue) : this.allUsers.slice()));
		}

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.organizationService.view({ id: ID, orgs: [] })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(organization => {
					this.imageUrl = organization.imageUrl;
					this.organization = organization;
					this.owner = organization.owner;
					this.organizationForm.patchValue(organization);
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

		this.userService.list({}).subscribe(users => this.allUsers = users);
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
		this.imageUrl = this.organizationForm.get('imageUrl').value;
	}

	onSave() {
		this.isLoading = true;

		this.uploader.onCompleteAll = () => {
			console.log('completed all');
			this.isLoading = false;
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			if (status === 200 && item.isSuccess) {
				const res = JSON.parse(response);
				// mer THEN override image with new URL
				merge(this.organization, <Organization>this.organizationForm.value);
				this.organization.imageUrl = res.secure_url;
				this.updateWithApi();
			}
		};

		// if its a new image need to fire off upload
		// upload will then update the back end with new url
		if (this.newImage) {
			this.uploader.uploadAll();
		} else {
			merge(this.organization, <Organization>this.organizationForm.value);
			this.updateWithApi();
		}
	}

	updateWithApi() {
		this.organization.owner = this.owner;
		console.log('would update with: ', this.organization);
		this.organizationService.update({ id: this.organization._id, entity: this.organization })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				if (t.error) {
					this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
				} else {
					this.openSnackBar('Succesfully updated', 'OK');
					this.router.navigate(['/organizations']);
				}
			});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 2000,
			horizontalPosition: 'center'
		});
	}

	userSelected(event: any) {
		const selectedItem = event.option.value;
		// have to make sure the item isn't already in the list
		this.owner = selectedItem;
		this.organizationForm.get('owner').setValue('');
		this.userInput.nativeElement.value = '';
	}

	userRemoved(user: any) {
		this.owner = null;
	}

	private _filter(value: any): User[] {
		// is value an instance of user? just use email if it is
		const filterValue = value.email ? value.email.toLowerCase() : value.toLowerCase();

		const filterVal = this.allUsers.filter((user: User) => {
			const name = user.firstName.toLowerCase() + user.lastName.toLowerCase();
			const email = user.email;
			const isInName = name.indexOf(filterValue) !== -1;
			const isInEmail = email.indexOf(filterValue) !== -1;
			return (isInName || isInEmail);
		});
		return filterVal;
	}

}
