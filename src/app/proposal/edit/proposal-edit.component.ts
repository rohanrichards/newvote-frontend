import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatAutocomplete, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { map, startWith, finalize } from 'rxjs/operators';
import { merge } from 'lodash';

import { IProposal } from '@app/core/models/proposal.model';
import { ISolution } from '@app/core/models/solution.model';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { Organization } from '@app/core/models/organization.model';
import { OrganizationService } from '@app/core/http/organization/organization.service';
import { MetaService } from '@app/core/meta.service';

@Component({
	selector: 'app-proposal',
	templateUrl: './proposal-edit.component.html',
	styleUrls: ['./proposal-edit.component.scss']
})
export class ProposalEditComponent implements OnInit {

	proposal: IProposal;
	allSolutions: Array<ISolution> = [];
	solutions: Array<ISolution> = [];
	organization: Organization;
	filteredSolutions: Observable<ISolution[]>;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	isLoading: boolean;
	imageUrl: any;
	imageFile: File;
	newImage = false;
	uploader: FileUploader;
	proposalForm = new FormGroup({
		title: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		solutions: new FormControl(''),
		imageUrl: new FormControl('', [Validators.required])
	});

	@ViewChild('solutionInput') solutionInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	constructor(
		private proposalService: ProposalService,
		private solutionService: SolutionService,
		private organizationService: OrganizationService,
		private route: ActivatedRoute,
		public snackBar: MatSnackBar,
		private router: Router,
		private meta: MetaService
	) {
		this.filteredSolutions = this.proposalForm.get('solutions').valueChanges.pipe(
			startWith(''),
			map((solution: string) => solution ? this._filter(solution) : this.allSolutions.slice()));
	}

	ngOnInit() {
		this.isLoading = true;
		this.route.paramMap.subscribe(params => {
			const ID = params.get('id');
			this.proposalService.view({ id: ID, orgs: [] })
				.pipe(finalize(() => { this.isLoading = false; }))
				.subscribe(proposal => {
					this.imageUrl = proposal.imageUrl;
					this.proposal = proposal;
					for (let i = 0; i < proposal.solutions.length; i++) {
						const solution = proposal.solutions[i];
						this.solutions.push(solution);
					}
					this.proposalForm.setValue({
						'title': proposal.title,
						'description': proposal.description,
						'imageUrl': proposal.imageUrl,
						'solutions': ''
					});
					this.meta.updateTags(
						{
							title: `Edit ${proposal.title}`,
							appBarTitle: 'Edit Action',
							description: `${proposal.description}`
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

		this.solutionService.list({})
			.subscribe(solutions => this.allSolutions = solutions);

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
		this.imageUrl = this.proposalForm.get('imageUrl').value;
	}

	onSave() {
		this.isLoading = true;
		this.proposal.organizations = this.organization;

		this.uploader.onCompleteAll = () => {
			console.log('completed all');
			this.isLoading = false;
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number) => {
			if (status === 200 && item.isSuccess) {
				merge(this.proposal, <IProposal>this.proposalForm.value);
				const res = JSON.parse(response);
				this.proposal.imageUrl = res.secure_url;
				this.updateWithApi();
			}
		};

		if (this.newImage) {
			this.uploader.uploadAll();
		} else {
			merge(this.proposal, <IProposal>this.proposalForm.value);
			this.updateWithApi();
		}
	}

	updateWithApi() {
		this.proposal.solutions = this.solutions;
		console.log('would update with: ', this.proposal);
		this.proposalService.update({ id: this.proposal._id, entity: this.proposal })
			.pipe(finalize(() => { this.isLoading = false; }))
			.subscribe((t) => {
				if (t.error) {
					this.openSnackBar(`Something went wrong: ${t.error.status} - ${t.error.statusText}`, 'OK');
				} else {
					this.openSnackBar('Succesfully updated', 'OK');
					this.router.navigate(['/proposals']);
				}
			});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 4000,
			horizontalPosition: 'right'
		});
	}

	solutionSelected(event: any) {
		const selectedItem = event.option.value;
		// have to make sure the item isn't already in the list
		if (!this.solutions.some(solution => solution._id === selectedItem._id)) {
			this.solutions.push(event.option.value);
			this.proposalForm.get('solutions').setValue('');
			this.solutionInput.nativeElement.value = '';
		} else {
			this.proposalForm.get('solutions').setValue('');
			this.solutionInput.nativeElement.value = '';
		}
	}

	solutionRemoved(solution: any) {
		const index = this.solutions.indexOf(solution);

		if (index >= 0) {
			this.solutions.splice(index, 1);
		}
	}

	add(event: any) {
		// console.log(event);
	}

	private _filter(value: any): ISolution[] {
		const filterValue = value.title ? value.title.toLowerCase() : value.toLowerCase();

		const filterVal = this.allSolutions.filter(solution => {
			const name = solution.title.toLowerCase();
			const compare = name.indexOf(filterValue) !== -1;
			return compare;
		});
		return filterVal;
	}

}
