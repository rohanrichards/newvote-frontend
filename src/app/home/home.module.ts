import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Angulartics2Module } from 'angulartics2';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { IssueService } from '@app/core/http/issue/issue.service';
import { SolutionService } from '@app/core/http/solution/solution.service';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { UserService } from '@app/core/http/user/user.service';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		CoreModule,
		SharedModule,
		FlexLayoutModule,
		MaterialModule,
		Angulartics2Module,
		HomeRoutingModule
	],
	declarations: [
		HomeComponent
	],
	providers: [
		IssueService,
		ProposalService,
		UserService,
		SolutionService
	]
})
export class HomeModule { }
