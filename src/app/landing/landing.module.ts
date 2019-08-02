import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@app/material.module';

import { LandingComponent } from './landing.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		FlexLayoutModule,
		MaterialModule
	],
	declarations: [LandingComponent]
})
export class LandingModule { }
