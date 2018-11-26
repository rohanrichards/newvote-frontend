import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '@app/material.module';
import { ShareModule } from '@ngx-share/core';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { LoaderComponent } from './loader/loader.component';
import { ShareButtonsComponent } from './share-buttons/share-buttons.component';
import { GridListComponent } from './grid-list/grid-list.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { TopicTagsComponent } from './topic-tags/topic-tags.component';

import { MoreLessComponent } from './more-less/more-less.component';

@NgModule({
	imports: [
		FlexLayoutModule,
		MaterialModule,
		TranslateModule,
		CommonModule,
		ShareModule,
		AngularFontAwesomeModule,
		RouterModule
	],
	declarations: [
		LoaderComponent,
		ShareButtonsComponent,
		GridListComponent,
		ConfirmDialogComponent,
		MoreLessComponent,
		HeaderBarComponent,
		TopicTagsComponent
	],
	exports: [
		LoaderComponent,
		ShareButtonsComponent,
		GridListComponent,
		ConfirmDialogComponent,
		MoreLessComponent,
		HeaderBarComponent,
		TopicTagsComponent
	]
})
export class SharedModule { }
