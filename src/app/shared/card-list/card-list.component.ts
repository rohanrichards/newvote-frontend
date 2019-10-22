import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatDialog } from '@angular/material'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { optimizeImage } from '@app/shared/helpers/cloudinary'
import { MetaService } from '@app/core/meta.service'
import { Observable } from 'rxjs'

@Component({
    selector: 'app-card-list',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {

    @Input() path: string;
    @Input() model: string;
    @Input() items: Array<any>;
    @Input() items$: Observable<any>;
    @Input() showChildren = false;
    @Input() childPath: string;
    @Input() childName: string;
    @Input() showParent = false;
    @Input() parentPath: string;
    @Input() parentPropName: string;
    @Input() isError: boolean;
    @Output() restore = new EventEmitter();
    @Output() softDelete = new EventEmitter();
    @Output() delete = new EventEmitter();
    @Output() vote = new EventEmitter();
    @Output() childVote = new EventEmitter();
    handleImageUrl = optimizeImage;
    organizationName: string;

    constructor(
        public dialog: MatDialog,
        private auth: AuthenticationService,
        private meta: MetaService
    ) { }

    ngOnInit() {
        this.organizationName = this.meta.organization.name
    }

    onDelete(item: any, event: any) {
        event.stopPropagation()
        this.delete.emit(item)
    }

    onSoftDelete(item: any, event: any) {
        event.stopPropagation()
        this.softDelete.emit(item)
    }

    onVote(event: any) {
        this.vote.emit(event)
    }

    onChildVote(event: any) {
        this.childVote.emit(event)
    }

    onRestore(item: any, event: any) {
        event.stopPropagation()
        this.restore.emit(item)
    }

    getSuggestionIcon(suggestionType: string, min?: boolean) {
        const suggestionIcons = ['assets/solution-icon', 'assets/issue-icon', 'assets/action-icon']
        const iconType = ['solution', 'issue', 'action']

        if (min) {
            const iconIndex = iconType.findIndex((item) => item === suggestionType)
            return `${suggestionIcons[iconIndex]}-min.png`
        }

        const iconIndex = iconType.findIndex((item) => item === suggestionType)
        return `${suggestionIcons[iconIndex]}.png`
    }

    trackByFn(index: any, item: any) {
        return index || item.id // or item.id
    }
}
