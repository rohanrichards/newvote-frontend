import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepsRoutingModule } from './reps-routing.module';
import { RepsComponent } from './reps.component';
import { SharedModule } from '@app/shared';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { QuillModule } from 'ngx-quill';
import { QuillSettings } from '@app/shared/quill/quill.settings';
import { RepsListComponent } from './list/reps-list.component';
import { RepsViewComponent } from './view/reps-view.component';


@NgModule({
    declarations: [
        RepsComponent,
        RepsListComponent,
        RepsViewComponent
    ],
    imports: [
        CommonModule,
        RepsRoutingModule,
        SharedModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        MaterialFileInputModule,
        QuillModule.forRoot(QuillSettings)
    ]
})
export class RepsModule { }
