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
import { SolutionRoutingModule } from './solution-routing.module';
import { SolutionListComponent } from './list/solution-list.component';
import { SolutionViewComponent } from './view/solution-view.component';
import { SolutionCreateComponent } from './create/solution-create.component';
import { SolutionEditComponent } from './edit/solution-edit.component';

import { SolutionService } from '@app/core/http/solution/solution.service';
import { IssueService } from '@app/core/http/issue/issue.service';
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
		SolutionRoutingModule,
		LazyLoadImageModule.forRoot({
			preset: intersectionObserverPreset
		})
	],
	declarations: [
		SolutionListComponent,
		SolutionViewComponent,
		SolutionCreateComponent,
		SolutionEditComponent
	],
	providers: [
		SolutionService,
		VoteService,
		IssueService
	]
})
export class SolutionModule { }
