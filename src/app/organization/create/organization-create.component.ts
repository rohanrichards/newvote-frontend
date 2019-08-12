import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { map, startWith, finalize } from 'rxjs/operators';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { UserService } from '@app/core/http/user/user.service';
import { Organization } from '@app/core/models/organization.model';
import { User } from '@app/core/models/user.model';
import { MetaService } from '@app/core/meta.service';

@Component({
	selector: 'app-organization',
	templateUrl: './organization-create.component.html',
	styleUrls: ['./organization-create.component.scss']
})
export class OrganizationCreateComponent implements OnInit {

	organization: Organization;
	allUsers: Array<User> = [];
	owner: User;
	filteredUsers: Observable<User[]>;
	separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
	isLoading = true;
	backgroundImage: any;
	iconImage: any;
	uploader: FileUploader;
	isValid = false;

	organizationForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		url: new FormControl('', [Validators.required]),
		organizationUrl: new FormControl(''),
		description: new FormControl('', [Validators.required]),
		longDescription: new FormControl('', [Validators.required]),
		imageUrl: new FormControl('', [Validators.required]),
		iconUrl: new FormControl('', [Validators.required]),
		owner: new FormControl(''),
		moderators: new FormControl([]),
		moderatorsControl: new FormControl([], [Validators.email]),
		authType: new FormControl(0, [Validators.required]),
		authUrl: new FormControl('', [Validators.required]),
		authEntityId: new FormControl('', [Validators.required]),
		privateOrg: new FormControl(false, [Validators.required])
	});

	uploaderOptions: FileUploaderOptions = {
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

	@ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;
	@ViewChild('moderatorInput') moderatorInput: ElementRef<HTMLInputElement>;

	constructor(
		private userService: UserService,
		private organizationService: OrganizationService,
		public auth: AuthenticationService,
		public snackBar: MatSnackBar,
		private route: ActivatedRoute,
		private router: Router,
		private meta: MetaService
	) {
		this.filteredUsers = this.organizationForm.get('owner').valueChanges.pipe(
			startWith(''),
			map((issue: string) => issue ? this._filter(issue) : this.allUsers.slice()));
	}

	ngOnInit() {
		this.isLoading = true;

		this.uploader = new FileUploader(this.uploaderOptions);
		this.uploader.onBuildItemForm = this.buildItemForm();

		if (this.auth.isAdmin()) {
			this.userService.list({}).subscribe(users => {
				this.allUsers = users;
				this.isLoading = false;
			});
		}
		this.meta.updateTags(
			{
				title: 'Create Community',
				description: 'Create a new community on the NewVote platform.'
			});

		this.setAuthtypeValidators();
	}

	setAuthtypeValidators() {
		const authUrl = this.organizationForm.get('authUrl');
		const authEntityId = this.organizationForm.get('authEntityId');

		this.organizationForm.get('authType').valueChanges
			.subscribe((authType) => {

				if (authType === 0) {
					authUrl.setValidators(null);
					authEntityId.setValidators(null);
				}

				if (authType === 1) {
					authUrl.setValidators([Validators.required]);
					authEntityId.setValidators([Validators.required]);
				}

				authUrl.updateValueAndValidity();
				authEntityId.updateValueAndValidity();
			});
	}

	buildItemForm() {
		return (fileItem: any, form: FormData): any => {
			// Add Cloudinary's unsigned upload preset to the upload form
			form.append('upload_preset', 'qhf7z3qa');
			// Add file to upload
			form.append('file', fileItem);

			// Use default "withCredentials" value for CORS requests
			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}

	onFileChange(field: string, event: any) {
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			const reader = new FileReader();

			reader.onload = (pe: ProgressEvent) => {
				// when the file is changed store the file name for later
				this[field] = {
					name: file.name,
					src: (<FileReader>pe.target).result
				};
			};

			reader.readAsDataURL(file);
		}
	}


	onSave() {
		this.isLoading = true;
		this.organization = this.organizationForm.value;

		if (!this.owner && this.isValid) {
			this.organization.owner = null;
			this.organization.newLeaderEmail = this.userInput.nativeElement.value;
			this.userInput.nativeElement.value = '';
		} else {
			this.organization.owner = this.owner;
			this.organization.newLeaderEmail = null;
		}

		this.uploader.onCompleteAll = () => {
			// console.log('completed all');
			// console.log('saving: ', this.organization);
			this.organizationService.create({ entity: this.organization })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(t => {
					if (t.error) {
						this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
					} else {
						this.openSnackBar('Succesfully created', 'OK');
						this.router.navigate([`/organizations`], { queryParams: { forceUpdate: true } });
					}
				});
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			// when the upload is complete compare the files name
			// to the one we stored earlier so we know which file it is
			if (status === 200 && item.isSuccess) {
				const res = JSON.parse(response);
				if (item.file.name === this.backgroundImage.name) {
					// this was the background image file
					this.organization.imageUrl = res.secure_url;
				} else if (item.file.name === this.iconImage.name) {
					// this was the icon image file
					this.organization.iconUrl = res.secure_url;
				}
			}
		};

		this.uploader.uploadAll();
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
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

	moderatorSelected(event: any) {
		console.log('moderator selected: ', event);
		const selectedItem = event.value;
		if (selectedItem && selectedItem != null) {
			const moderators = this.organizationForm.value.moderators;
			if (moderators.indexOf(selectedItem) === -1) {
				moderators.push(selectedItem);
				this.organizationForm.patchValue({ moderators });
			}
			this.organizationForm.get('moderatorsControl').setValue('');
			this.moderatorInput.nativeElement.value = '';
		}
	}

	moderatorRemoved(mod: any) {
		const moderators = this.organizationForm.value.moderators;
		const index = moderators.indexOf(mod);
		moderators.splice(index, 1);
		this.organizationForm.patchValue(moderators);
	}

	handleChange(email: any) {
		// https://tylermcginnis.com/validate-email-address-javascript/
		this.isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
