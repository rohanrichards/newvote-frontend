import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { QuillModule } from 'ngx-quill';

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
		QuillModule.forRoot({
			modules: {
				toolbar: [
					['bold', 'italic', 'underline', 'strike'],
					['blockquote', 'code-block'],
					[{ 'header': 1 }, { 'header': 2 }],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }],
					[{ 'script': 'sub' }, { 'script': 'super' }],
					[{ 'indent': '-1' }, { 'indent': '+1' }],
					[{ 'direction': 'rtl' }],
					[{ 'size': ['small', false, 'large', 'huge'] }],
					[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
					[{ 'color': [] }, { 'background': [] }],
					[{ 'font': [] }],
					[{ 'align': [] }],
					['clean'],
				]
			}
		}),
		FileUploadModule,
		SolutionRoutingModule
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
