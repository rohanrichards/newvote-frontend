import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { QuillModule } from 'ngx-quill';
import { FileUploadModule } from 'ng2-file-upload';

import { MaterialModule } from '@app/material.module';
import { ProposalRoutingModule } from './proposal-routing.module';
import { ProposalListComponent } from './list/proposal-list.component';
import { ProposalViewComponent } from './view/proposal-view.component';
import { ProposalCreateComponent } from './create/proposal-create.component';
import { ProposalEditComponent } from './edit/proposal-edit.component';

import { ProposalService } from '@app/core/http/proposal/proposal.service';
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
		QuillModule,
		FileUploadModule,
		ProposalRoutingModule
	],
	declarations: [
		ProposalListComponent,
		ProposalViewComponent,
		ProposalCreateComponent,
		ProposalEditComponent
	],
	providers: [
		ProposalService,
		VoteService,
		IssueService
	]
})
export class ProposalModule { }
