import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepsRoutingModule } from './reps-routing.module';
import { SharedModule } from '@app/shared';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { QuillModule } from 'ngx-quill';
import { QuillSettings } from '@app/shared/quill/quill.settings';
import { RepsListComponent } from './list/reps-list.component';
import { RepsViewComponent } from './view/reps-view.component';
import { LazyLoadImageModule, ScrollHooks } from 'ng-lazyload-image';
import { RepsEditComponent } from './edit/reps-edit.component';
import { RepsCreateComponent } from './create/reps-create.component';
import { FileUploadModule } from 'ng2-file-upload';
import { RepService } from '@app/core/http/rep/rep.service';


@NgModule({
    declarations: [
        RepsListComponent,
        RepsViewComponent,
        RepsEditComponent,
        RepsCreateComponent
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
        QuillModule.forRoot(QuillSettings),
        LazyLoadImageModule.forRoot(ScrollHooks),
        FileUploadModule
    ],
    providers: [
        RepService
    ]
})
export class RepsModule { }
