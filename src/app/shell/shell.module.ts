import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@app/material.module';
import { SharedModule } from '@app/shared';

import { SearchService } from '@app/core/http/search/search.service';

import { ShellComponent } from './shell.component';
import { JoyrideModule } from 'ngx-joyride';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		TranslateModule,
		FlexLayoutModule,
		MaterialModule,
		JoyrideModule.forChild(),
		RouterModule
	],
	declarations: [
		ShellComponent
	],
	providers: [
		SearchService
	]
})
export class ShellModule {
}
