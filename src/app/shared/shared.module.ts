import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FlexLayoutModule } from '@angular/flex-layout'
import { TranslateModule } from '@ngx-translate/core'
import { RouterModule } from '@angular/router'
import { SwiperModule } from 'ngx-swiper-wrapper'
import { MatBadgeModule } from '@angular/material/badge'
import { ClipboardModule } from 'ngx-clipboard'
import { MaterialModule } from '@app/material.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ShareModule } from '@ngx-share/core'
import { AngularFontAwesomeModule } from 'angular-font-awesome'

import { QuillModule } from 'ngx-quill'
import { MinimalQuillSettings } from '@app/shared/quill/quill.settings'

import { LoaderComponent } from './loader/loader.component'
import { ShareButtonsComponent } from './share-buttons/share-buttons.component'
import { GridListComponent } from './grid-list/grid-list.component'
import { CardListComponent } from './card-list/card-list.component'
import { SwiperWrapperComponent } from './swiper-wrapper/swiper-wrapper.component'
import { VoteButtonsComponent } from './vote-buttons/vote-buttons.component'
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'
import { HeaderBarComponent } from './header-bar/header-bar.component'
import { TopicTagsComponent } from './topic-tags/topic-tags.component'
import { SearchBarComponent } from './search-bar/search-bar.component'
import { MoreLessComponent } from './more-less/more-less.component'
import { SkeletonHeaderComponent } from './skeleton/skeleton-header/skeleton-header.component'
import { SkeletonTextBarComponent } from './skeleton/skeleton-text-bar/skeleton-text-bar.component'
import { SkeletonButtonComponent } from './skeleton/skeleton-button/skeleton-button.component'
import { SkeletonSocialButtonComponent } from './skeleton/skeleton-social-button/skeleton-social-button.component'
import { SkeletonSocialBarComponent } from './skeleton/skeleton-social-bar/skeleton-social-bar.component'
import { SkeletonWideCardComponent } from './skeleton/skeleton-card/skeleton-wide-card/skeleton-wide-card.component'
import { SkeletonChildCardComponent } from './skeleton/skeleton-card/skeleton-child-card/skeleton-child-card.component'
import { SkeletonMediaCardComponent } from './skeleton/skeleton-card/skeleton-media-card/skeleton-media-card.component'
import { SkeletonCardComponent } from './skeleton/skeleton-card/skeleton-card.component'
import { SkeletonPanelComponent } from './skeleton/skeleton-panel/skeleton-panel.component'

import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image'
import { ErrorCardComponent } from './error/error-card/error-card.component'
import { NavbarComponent } from './navbar/navbar.component'
import { MakeSuggestionComponent } from './make-suggestion/make-suggestion.component';
import { RepModalComponent } from './rep-modal/rep-modal.component';
import { ChildCardComponent } from './child-card/child-card.component';
import { RepCardComponent } from './rep-card/rep-card.component';
import { SkeletonRepCardComponent } from './skeleton/skeleton-card/skeleton-rep-card/skeleton-rep-card.component';
import { CommunityCardComponent } from './community-card/community-card.component'
import { RepItemListComponent } from './rep-item-list/rep-item-list.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component'

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
        SwiperModule,
        MatBadgeModule,
        ClipboardModule,
        RouterModule,
        QuillModule.forRoot(MinimalQuillSettings),
        LazyLoadImageModule.forRoot({
            preset: intersectionObserverPreset
        })
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
        SearchBarComponent,
        SkeletonHeaderComponent,
        SkeletonTextBarComponent,
        SkeletonButtonComponent,
        SkeletonSocialButtonComponent,
        SkeletonSocialBarComponent,
        SkeletonWideCardComponent,
        SkeletonChildCardComponent,
        SkeletonMediaCardComponent,
        SkeletonCardComponent,
        SkeletonPanelComponent,
        ErrorCardComponent,
        NavbarComponent,
        MakeSuggestionComponent,
        RepModalComponent,
        ChildCardComponent,
        RepCardComponent,
        SkeletonRepCardComponent,
        CommunityCardComponent,
        RepItemListComponent,
        AdminPanelComponent,
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
        SearchBarComponent,
        SkeletonHeaderComponent,
        SkeletonTextBarComponent,
        SkeletonButtonComponent,
        SkeletonSocialButtonComponent,
        SkeletonSocialBarComponent,
        SkeletonWideCardComponent,
        SkeletonChildCardComponent,
        SkeletonMediaCardComponent,
        SkeletonCardComponent,
        SkeletonPanelComponent,
        ErrorCardComponent,
        NavbarComponent,
        MakeSuggestionComponent,
        RepModalComponent,
        ChildCardComponent,
        RepCardComponent,
        SkeletonRepCardComponent,
        CommunityCardComponent,
        AdminPanelComponent,
    ]
})
export class SharedModule { }
