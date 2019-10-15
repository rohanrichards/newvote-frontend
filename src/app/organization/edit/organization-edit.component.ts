import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { MatAutocomplete, MatSnackBar } from '@angular/material'
import { ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload'
import { Observable } from 'rxjs'
import { map, startWith, finalize, switchMap, debounceTime, distinctUntilChanged, take } from 'rxjs/operators'
import { merge, cloneDeep } from 'lodash'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { UserService } from '@app/core/http/user/user.service'
import { Organization } from '@app/core/models/organization.model'
import { User } from '@app/core/models/user.model'
import { MetaService } from '@app/core/meta.service'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'

@Component({
    selector: 'app-organization',
    templateUrl: './organization-edit.component.html',
    styleUrls: ['./organization-edit.component.scss']
})
export class OrganizationEditComponent implements OnInit {

    organization: Organization;
    allUsers: Array<User> = [];
    owner: User;
    futureOwner: any;
    filteredOwners: Observable<User[]>;
    separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    isLoading: boolean;
    uploader: FileUploader;
    isValid = false;

    checkboxOptions = ['student', 'faculty', 'staff', 'employee', 'member'];

    organizationForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        organizationName: new FormControl(''),
        url: new FormControl('', [Validators.required]),
        organizationUrl: new FormControl(''),
        description: new FormControl('', [Validators.required]),
        longDescription: new FormControl(''),
        imageUrl: new FormControl(''),
        iconUrl: new FormControl(''),
        owner: new FormControl(''),
        futureOwner: new FormControl(''),
        moderators: new FormControl([]),
        moderatorsControl: new FormControl([], [Validators.email]),
        authType: new FormControl(0, [Validators.required]),
        authUrl: new FormControl(''),
        authEntityId: new FormControl(''),
        privateOrg: new FormControl(false, [Validators.required]),
        voteRoles: new FormArray([
            new FormGroup({
                role: new FormControl('student'),
                active: new FormControl(false)
            }),
            new FormGroup({
                role: new FormControl('faculty'),
                active: new FormControl(false)
            }),
            new FormGroup({
                role: new FormControl('staff'),
                active: new FormControl(false)
            }),
            new FormGroup({
                role: new FormControl('employee'),
                active: new FormControl(false)
            }),
            new FormGroup({
                role: new FormControl('member'),
                active: new FormControl(false)
            })
        ])
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
        url: 'https://api.cloudinary.com/v1_1/newvote/upload',
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

    @ViewChild('ownerInput', { static: false }) ownerInput: ElementRef<HTMLInputElement>;
    @ViewChild('ownerAuto', { static: false }) ownerAutocomplete: MatAutocomplete;
    @ViewChild('moderatorInput', { static: false }) moderatorInput: ElementRef<HTMLInputElement>;

    constructor(
        private userService: UserService,
        private organizationService: OrganizationService,
        public auth: AuthenticationService,
        private route: ActivatedRoute,
        public snackBar: MatSnackBar,
        private location: Location,
        private meta: MetaService,
        private organizationQuery: OrganizationQuery
    ) {
        this.filteredOwners = this.organizationForm.get('owner').valueChanges.pipe(
            startWith(''),
            map((user: string) => user ? this._filter(user) : this.allUsers.slice()))
    }

    ngOnInit() {
        this.isLoading = true
        this.subscribeToOrganizationStore();
        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.organizationService.view({ id: ID, orgs: [] })
                .pipe(finalize(() => { this.isLoading = false }))
                .subscribe((
                    res: Organization) => res,
                    (err) => err
                );
        })

        this.uploader = new FileUploader(this.uploaderOptions)
        this.uploader.onBuildItemForm = this.buildItemForm()

        if (this.auth.isAdmin()) {
            this.userService.list({}).subscribe(users => this.allUsers = users)
        }


        this.setAuthtypeValidators()
    }

    subscribeToOrganizationStore() {
        this.organizationQuery.select()
            .subscribe(
                (organization: Organization) => {
                    if (!organization) return false;
                    this.organization = organization;
                    this.updateForm(organization);
                    this.updateTags(organization);
                },
                (err) => err
            )
    }

    updateForm(storeOrganization: Organization) {
        // copy store data to prevent readonly values from store 
        const organization = cloneDeep(storeOrganization);

        this.backgroundImage.src = organization.imageUrl
        this.iconImage.src = organization.iconUrl
        this.owner = organization.owner
        this.futureOwner = organization.futureOwner

        organization.moderators = organization.moderators.map((m: any) => m.email ? m.email : m)

        this.organizationForm.patchValue({
            name: organization.name,
            organizationName: organization.organizationName,
            description: organization.description,
            longDescription: organization.longDescription,
            url: organization.url,
            moderators: organization.moderators,
            organizationUrl: organization.organizationUrl,
            futureOwner: organization.futureOwner,
            newLeaderEmail: '',
            authType: organization.authType,
            authUrl: organization.authUrl,
            authEntityId: organization.authEntityId,
            privateOrg: organization.privateOrg || false,
            voteRoles: organization.voteRoles
        })
    }

    updateTags(organization: Organization) {
        this.meta.updateTags(
            {
                title: `Edit ${organization.name} Community`,
                appBarTitle: 'Edit Community',
                description: `Edit the ${organization.name} community on the NewVote platform.`
            })
    }

    setAuthtypeValidators() {
        const authUrl = this.organizationForm.get('authUrl')
        const authEntityId = this.organizationForm.get('authEntityId')

        this.organizationForm.get('authType').valueChanges
            .subscribe((authType) => {

                if (authType === 0) {
                    authUrl.setValidators(null)
                    authEntityId.setValidators(null)
                }

                if (authType === 1) {
                    authUrl.setValidators([Validators.required])
                    authEntityId.setValidators([Validators.required])
                }

                authUrl.updateValueAndValidity()
                authEntityId.updateValueAndValidity()
            })
    }

    buildItemForm() {
        return (fileItem: any, form: FormData): any => {
            // Add Cloudinary's unsigned upload preset to the upload form
            form.append('upload_preset', 'qhf7z3qa')
            // Add file to upload
            form.append('file', fileItem)

            // Use default "withCredentials" value for CORS requests
            fileItem.withCredentials = false
            return { fileItem, form }
        }
    }

    onFileChange(field: string, event: any) {
        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files
            const reader = new FileReader()

            // this.imageFile = file;

            reader.onload = (pe: ProgressEvent) => {
                const old = this[field].src
                this[field] = {
                    name: file.name,
                    src: (<FileReader>pe.target).result,
                    new: true,
                    old: old
                }
            }

            reader.readAsDataURL(file)
        }
    }

    onResetImage(field: string) {
        this[field].new = false
        this[field].src = this[field].old
    }

    onSave() {
        this.isLoading = true

        this.uploader.onCompleteAll = () => {
            this.updateWithApi()
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
            if (status === 200 && item.isSuccess) {
                const res = JSON.parse(response)

                // when the upload is complete compare the files name
                // to the one we stored earlier so we know which file it is
                if (item.file.name && item.file.name === this.backgroundImage.name) {
                    // this was the background image file
                    this.backgroundImage.src = res.secure_url
                } else if (item.file.name && item.file.name === this.iconImage.name) {
                    // this was the icon image file
                    this.iconImage.src = res.secure_url
                }
            }
        }

        // if its a new image need to fire off upload otherwise just update back end
        if (this.backgroundImage.new || this.iconImage.new) {
            this.uploader.uploadAll()
        } else {
            this.updateWithApi()
        }
    }

    updateWithApi() {
        const organization = cloneDeep(this.organization);
        // update this.org with form data and the owner manually
        merge(organization, <Organization>this.organizationForm.value)
        organization.owner = this.owner
        organization.futureOwner = this.futureOwner
        organization.imageUrl = this.backgroundImage.src
        organization.iconUrl = this.iconImage.src

        this.organizationService.update({ id: organization._id, entity: organization })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe((t) => {
                this.openSnackBar('Succesfully updated', 'OK')
                this.location.back()
            },
                (error) => {
                    this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
                })
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'center'
        })
    }

    ownerSelected(event: any) {
        const selectedItem = event.option.value
        this.owner = selectedItem
        this.organizationForm.get('owner').setValue('')
        this.ownerInput.nativeElement.value = ''
    }

    moderatorSelected(event: any) {
        const selectedItem = event.value
        if (selectedItem && selectedItem != null) {
            const moderators = this.organizationForm.value.moderators
            if (moderators.indexOf(selectedItem) === -1) {
                moderators.push(selectedItem)
                this.organizationForm.patchValue({ moderators })
            }
            this.organizationForm.get('moderatorsControl').setValue('')
            this.moderatorInput.nativeElement.value = ''
        }
    }

    moderatorRemoved(mod: any) {
        const moderators = this.organizationForm.value.moderators
        const index = moderators.indexOf(mod)
        moderators.splice(index, 1)
        this.organizationForm.patchValue(moderators)
    }

    ownerRemoved() {
        this.owner = null
    }

    futureOwnerRemoved() {
        this.futureOwner = null
    }

    handleChange(email: any) {
        // https://tylermcginnis.com/validate-email-address-javascript/
        this.isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    submitOwnerEmail(input: any) {
        const { value: email } = input.nativeElement
        this.ownerInput.nativeElement.value = ''
        this.isValid = false

        this.organization.owner = null
        this.organization.futureOwner = null

        this.organization.newLeaderEmail = email

        this.organizationService.setFutureOwner({ id: this.organization._id, entity: this.organization })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe((t) => {
                if (t.error) {
                    this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK')
                } else {
                    this.openSnackBar('Succesfully updated', 'OK')
                    // this.location.back();
                }
            })
    }

    private _filter(value: any): User[] {
        // is value an instance of user? just use email if it is
        const filterValue = value.email ? value.email.toLowerCase() : value.toLowerCase()

        const filterVal = this.allUsers.filter((user: User) => {
            const name = user.firstName.toLowerCase() + user.lastName.toLowerCase()
            const email = user.email
            const isInName = name.indexOf(filterValue) !== -1
            const isInEmail = email.indexOf(filterValue) !== -1
            return (isInName || isInEmail)
        })
        return filterVal
    }

}
