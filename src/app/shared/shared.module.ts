import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { MatBadgeModule } from '@angular/material/badge';
import { ClipboardModule } from 'ngx-clipboard';
import { MaterialModule } from '@app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShareModule } from '@ngx-share/core';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { LoaderComponent } from './loader/loader.component';
import { ShareButtonsComponent } from './share-buttons/share-buttons.component';
import { GridListComponent } from './grid-list/grid-list.component';
import { CardListComponent } from './card-list/card-list.component';
import { SwiperWrapperComponent } from './swiper-wrapper/swiper-wrapper.component';
import { VoteButtonsComponent } from './vote-buttons/vote-buttons.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { TopicTagsComponent } from './topic-tags/topic-tags.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { MoreLessComponent } from './more-less/more-less.component';

@NgModule({
	imports: [
		FlexLayoutModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		TranslateModule,
		CommonModule,
		ShareModule,
		AngularFontAwesomeModule,
		ChartsModule,
		SwiperModule,
		MatBadgeModule,
		ClipboardModule,
		RouterModule,
	],
	declarations: [
		LoaderComponent,
		ShareButtonsComponent,
		GridListComponent,
		CardListComponent,
		SwiperWrapperComponent,
		VoteButtonsComponent,
		ConfirmDialogComponent,
		MoreLessComponent,
		HeaderBarComponent,
		TopicTagsComponent,
		SearchBarComponent
	],
	exports: [
		LoaderComponent,
		ShareButtonsComponent,
		GridListComponent,
		CardListComponent,
		SwiperWrapperComponent,
		VoteButtonsComponent,
		ConfirmDialogComponent,
		MoreLessComponent,
		HeaderBarComponent,
		TopicTagsComponent,
		SearchBarComponent
	]
})
export class SharedModule { }
