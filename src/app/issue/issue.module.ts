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
import { IssueRoutingModule } from './issue-routing.module';

import { IssueListComponent } from './list/issue-list.component';
import { IssueViewComponent } from './view/issue-view.component';
import { IssueCreateComponent } from './create/issue-create.component';
import { IssueEditComponent } from './edit/issue-edit.component';

import { TopicService } from '@app/core/http/topic/topic.service';
import { IssueService } from '@app/core/http/issue/issue.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { MediaService } from '@app/core/http/media/media.service';
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
		IssueRoutingModule
	],
	declarations: [
		IssueListComponent,
		IssueViewComponent,
		IssueCreateComponent,
		IssueEditComponent
	],
	providers: [
		TopicService,
		SolutionService,
		IssueService,
		MediaService,
		VoteService
	]
})
export class IssueModule { }
