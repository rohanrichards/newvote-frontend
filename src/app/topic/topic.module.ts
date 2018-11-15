import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { TopicRoutingModule } from './topic-routing.module';
import { TopicListComponent } from './list/topic-list.component';
import { TopicService } from './topic.service';
import { SharedModule } from '@app/shared';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		TranslateModule,
		FlexLayoutModule,
		MaterialModule,
		TopicRoutingModule
	],
	declarations: [
		TopicListComponent
	],
	providers: [
		TopicService
	]
})
export class TopicModule { }
