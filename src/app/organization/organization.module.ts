import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { QuillModule } from 'ngx-quill';
import { QuillSettings } from '@app/shared/quill/quill.settings';

import { FileUploadModule } from 'ng2-file-upload';

import { MaterialModule } from '@app/material.module';
import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationListComponent } from './list/organization-list.component';
import { OrganizationViewComponent } from './view/organization-view.component';
import { OrganizationCreateComponent } from './create/organization-create.component';
import { OrganizationEditComponent } from './edit/organization-edit.component';
import { OrganizationClaimComponent } from './claim/organization-claim.component';

import { OrganizationService } from '@app/core/http/organization/organization.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { VoteService } from '@app/core/http/vote/vote.service';
import { SharedModule } from '@app/shared';

import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		TranslateModule,
		FlexLayoutModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		MaterialFileInputModule,
		QuillModule.forRoot(QuillSettings),
		FileUploadModule,
		OrganizationRoutingModule,
		LazyLoadImageModule.forRoot({
			preset: intersectionObserverPreset
		})
	],
	declarations: [
		OrganizationCreateComponent,
		OrganizationEditComponent,
		OrganizationListComponent,
		OrganizationViewComponent,
		OrganizationClaimComponent
	],
	providers: [
		OrganizationService,
		VoteService,
		SolutionService
	]
})
export class OrganizationModule { }
