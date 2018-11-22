import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { QuillModule } from 'ngx-quill';
import { FileUploadModule } from 'ng2-file-upload';

import { MaterialModule } from '@app/material.module';
import { TopicRoutingModule } from './topic-routing.module';
import { TopicListComponent } from './list/topic-list.component';
import { TopicViewComponent } from './view/topic-view.component';
import { TopicCreateComponent } from './create/topic-create.component';
import { TopicEditComponent } from './edit/topic-edit.component';

import { TopicService } from '@app/core/http/topic/topic.service';
import { IssueService } from '@app/core/http/issue/issue.service';
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
		QuillModule,
		FileUploadModule,
		TopicRoutingModule
	],
	declarations: [
		TopicListComponent,
		TopicViewComponent,
		TopicCreateComponent,
		TopicEditComponent
	],
	providers: [
		TopicService,
		IssueService
	]
})
export class TopicModule { }
