import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { QuillModule } from 'ngx-quill';
import { FileUploadModule } from 'ng2-file-upload';

import { MaterialModule } from '@app/material.module';
import { SuggestionRoutingModule } from './suggestion-routing.module';
import { SuggestionListComponent } from './list/suggestion-list.component';
import { SuggestionViewComponent } from './view/suggestion-view.component';
import { SuggestionCreateComponent } from './create/suggestion-create.component';
import { SuggestionEditComponent } from './edit/suggestion-edit.component';

import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
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
		QuillModule,
		FileUploadModule,
		SuggestionRoutingModule
	],
	declarations: [
		SuggestionListComponent,
		SuggestionViewComponent,
		SuggestionCreateComponent,
		SuggestionEditComponent
	],
	providers: [
		SuggestionService,
		VoteService,
		SolutionService
	]
})
export class SuggestionModule { }
