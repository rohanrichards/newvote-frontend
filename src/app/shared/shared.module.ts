import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '@app/material.module';
import { LoaderComponent } from './loader/loader.component';
import { GridListComponent } from './grid-list/grid-list.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';

import { MoreLessComponent } from './more-less/more-less.component';

@NgModule({
	imports: [
		FlexLayoutModule,
		MaterialModule,
		TranslateModule,
		CommonModule,
		RouterModule
	],
	declarations: [
		LoaderComponent,
		GridListComponent,
		ConfirmDialogComponent,
		MoreLessComponent,
		HeaderBarComponent
	],
	exports: [
		LoaderComponent,
		GridListComponent,
		ConfirmDialogComponent,
		MoreLessComponent,
		HeaderBarComponent
	]
})
export class SharedModule { }
