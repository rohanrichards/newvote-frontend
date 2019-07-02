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
import { MediaRoutingModule } from './media-routing.module';
import { MediaCreateComponent } from './create/media-create.component';
import { MediaEditComponent } from './edit/media-edit.component';

import { MediaService } from '@app/core/http/media/media.service';
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
		QuillModule.forRoot(QuillSettings),
		FileUploadModule,
		MediaRoutingModule
	],
	declarations: [
		MediaCreateComponent,
		MediaEditComponent
	],
	providers: [
		MediaService,
		VoteService,
		IssueService
	]
})
export class MediaModule { }
