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

import { LazyLoadImageModule, ScrollHooks } from 'ng-lazyload-image'
import { ErrorCardComponent } from './error/error-card/error-card.component'
import { NavbarComponent } from './navbar/navbar.component'
import { SortBarComponent } from './sort-bar/sort-bar.component'
import { MakeSuggestionComponent } from './make-suggestion/make-suggestion.component'
import { RepModalComponent } from './rep-modal/rep-modal.component'
import { ChildCardComponent } from './child-card/child-card.component'
import { RepCardComponent } from './rep-card/rep-card.component'
import { SkeletonRepCardComponent } from './skeleton/skeleton-card/skeleton-rep-card/skeleton-rep-card.component'
import { CommunityCardComponent } from './community-card/community-card.component'
import { RepItemListComponent } from './rep-item-list/rep-item-list.component'
import { AdminPanelComponent } from './admin-panel/admin-panel.component'
import { GridCardComponent } from './grid-list/grid-card/grid-card.component'
import { RepCardChildComponent } from './rep-card-child/rep-card-child.component'
import { RepChildCardListComponent } from './rep-child-card-list/rep-child-card-list.component'
import { SideMenuComponent } from './side-menu/side-menu.component'
import { RepCardV2Component } from './rep-card/rep-card-v2/rep-card-v2.component'
import { ProgressBarComponent } from './progress-bar/progress-bar.component'
import { ProgressFeedComponent } from './progress-feed/progress-feed.component'
import { ProgressFormComponent } from './progress-form/progress-form.component';
import { NotificationFeedComponent } from './notification-feed/notification-feed.component'
import { MomentModule } from 'ngx-moment';
import { IssuePickerComponent } from './issue-picker/issue-picker.component';
import { NotificationBellComponent, NotificationPopupDialog } from './notification-bell/notification-bell.component';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faFacebook, faLinkedin, faReddit } from '@fortawesome/free-brands-svg-icons';

@NgModule({
    imports: [
        FontAwesomeModule,
        FlexLayoutModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        CommonModule,
        ShareModule,
        SwiperModule,
        MatBadgeModule,
        ClipboardModule,
        RouterModule,
        MomentModule,
        QuillModule.forRoot(MinimalQuillSettings),
        LazyLoadImageModule.forRoot(ScrollHooks)
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
        SortBarComponent,
        RepModalComponent,
        ChildCardComponent,
        RepCardComponent,
        SkeletonRepCardComponent,
        CommunityCardComponent,
        RepItemListComponent,
        AdminPanelComponent,
        GridCardComponent,
        RepCardChildComponent,
        RepChildCardListComponent,
        SideMenuComponent,
        RepCardV2Component,
        ProgressBarComponent,
        ProgressFeedComponent,
        ProgressFormComponent,
        NotificationFeedComponent,
        IssuePickerComponent,
        NotificationBellComponent,
        NotificationPopupDialog
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
        SortBarComponent,
        RepModalComponent,
        ChildCardComponent,
        RepCardComponent,
        SkeletonRepCardComponent,
        CommunityCardComponent,
        AdminPanelComponent,
        SideMenuComponent,
        RepCardV2Component,
        ProgressBarComponent,
        ProgressFeedComponent,
        ProgressFormComponent,
        NotificationFeedComponent,
        IssuePickerComponent,
        NotificationBellComponent,
        
    ]
})
export class SharedModule { 
    constructor(library: FaIconLibrary) {
        library.addIcons(faTwitter, faFacebook, faLinkedin, faReddit, faPaperclip);
    }
}
