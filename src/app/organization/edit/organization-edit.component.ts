import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { map, startWith, finalize, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { merge } from 'lodash';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { UserService } from '@app/core/http/user/user.service';
import { Organization } from '@app/core/models/organization.model';
import { User } from '@app/core/models/user.model';
import { MetaService } from '@app/core/meta.service';

@Component({
	selector: 'app-organization',
	templateUrl: './organization-edit.component.html',
	styleUrls: ['./organization-edit.component.scss']
})
export class OrganizationEditComponent implements OnInit {

	organization: Organization;
	allUsers: Array<User> = [];
	owner: User;
	filteredOwners: Observable<User[]>;
	separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
	isLoading: boolean;
	uploader: FileUploader;

	organizationForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		url: new FormControl('', [Validators.required]),
		organizationUrl: new FormControl(''),
		description: new FormControl('', [Validators.required]),
		imageUrl: new FormControl(''),
		iconUrl: new FormControl(''),
		owner: new FormControl(''),
		moderators: new FormControl([]),
		moderatorsControl: new FormControl([], [Validators.email])
	});

	backgroundImage = {
		new: false,
		src: '',
		name: ''
	};
	iconImage = {
		new: false,
		src: '',
		name: ''
	};
	tempStorage = {
		icon: '',
		background: ''
	};

	// set up the file uploader
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

	@ViewChild('ownerInput') ownerInput: ElementRef<HTMLInputElement>;
	@ViewChild('ownerAuto') ownerAutocomplete: MatAutocomplete;
	@ViewChild('moderatorInput') moderatorInput: ElementRef<HTMLInputElement>;

	constructor(
		private userService: UserService,
		private organizationService: OrganizationService,
		public auth: AuthenticationService,
		private route: ActivatedRoute,
		public snackBar: MatSnackBar,
		private location: Location,
		private meta: MetaService
	) {
		this.filteredOwners = this.organizationForm.get('owner').valueChanges.pipe(
			startWith(''),
			map((user: string) => user ? this._filter(user) : this.allUsers.slice()));
	}

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.organizationService.view({ id: ID, orgs: [] })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe((organization: Organization) => {
					this.organization = organization;
					this.backgroundImage.src = organization.imageUrl;
					this.iconImage.src = organization.iconUrl;
					this.owner = organization.owner;

					organization.moderators = organization.moderators.map((m: any) => m.email ? m.email : m);

					this.organizationForm.patchValue({
						'name': organization.name,
						'description': organization.description,
						'url': organization.url,
						'moderators': organization.moderators
					});

					this.meta.updateTags(
						{
							title: `Edit ${organization.name} Community`,
							appBarTitle: 'Edit Community',
							description: `Edit the ${organization.name} community on the NewVote platform.`
						});
				});
		});

		this.uploader = new FileUploader(this.uploaderOptions);
		this.uploader.onBuildItemForm = this.buildItemForm();

		if (this.auth.isAdmin()) {
			this.userService.list({}).subscribe(users => this.allUsers = users);
		}
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

			// this.imageFile = file;

			reader.onload = (pe: ProgressEvent) => {
				const old = this[field].src;
				this[field] = {
					name: file.name,
					src: (<FileReader>pe.target).result,
					new: true,
					old: old
				};
			};

			reader.readAsDataURL(file);
		}
	}

	onResetImage(field: string) {
		this[field].new = false;
		this[field].src = this[field].old;
	}

	onSave() {
		this.isLoading = true;

		this.uploader.onCompleteAll = () => {
			this.updateWithApi();
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			if (status === 200 && item.isSuccess) {
				const res = JSON.parse(response);

				// when the upload is complete compare the files name
				// to the one we stored earlier so we know which file it is
				if (item.file.name && item.file.name === this.backgroundImage.name) {
					// this was the background image file
					this.backgroundImage.src = res.secure_url;
				} else if (item.file.name && item.file.name === this.iconImage.name) {
					// this was the icon image file
					this.iconImage.src = res.secure_url;
				}
			}
		};

		// if its a new image need to fire off upload otherwise just update back end
		if (this.backgroundImage.new || this.iconImage.new) {
			this.uploader.uploadAll();
		} else {
			this.updateWithApi();
		}
	}

	updateWithApi() {
		// update this.org with form data and the owner manually
		merge(this.organization, <Organization>this.organizationForm.value);
		this.organization.owner = this.owner;
		this.organization.imageUrl = this.backgroundImage.src;
		this.organization.iconUrl = this.iconImage.src;
		this.organizationService.update({ id: this.organization._id, entity: this.organization })
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
			horizontalPosition: 'center'
		});
	}

	ownerSelected(event: any) {
		const selectedItem = event.option.value;
		this.owner = selectedItem;
		this.organizationForm.get('owner').setValue('');
		this.ownerInput.nativeElement.value = '';
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

	ownerRemoved() {
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
