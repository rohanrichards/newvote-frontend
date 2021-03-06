import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileEditComponent } from './edit/profile-edit/profile-edit.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { QuillModule } from 'ngx-quill';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from '@app/shared';
import { ProfileIssueListComponent } from './components/profile-issue-list/profile-issue-list.component';
import { VoteBarComponent } from './components/vote-bar/vote-bar.component';

@NgModule({
    declarations: [ProfileEditComponent, ProfileIssueListComponent, VoteBarComponent],
    imports: [
        CommonModule,
        ProfileRoutingModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        MaterialFileInputModule,
        SharedModule,
        QuillModule.forRoot({
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ header: 1 }, { header: 2 }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ script: 'sub' }, { script: 'super' }],
                    [{ indent: '-1' }, { indent: '+1' }],
                    [{ direction: 'rtl' }],
                    [{ size: ['small', false, 'large', 'huge'] }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    [{ color: [] }, { background: [] }],
                    [{ font: [] }],
                    [{ align: [] }],
                    ['clean'],
                ]
            }
        }),
        MaterialFileInputModule,
        FileUploadModule,
    ]
})
export class ProfileModule { }
