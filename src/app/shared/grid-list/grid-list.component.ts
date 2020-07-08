import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core'
import { MatDialog } from '@angular/material/dialog';

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { Router } from '@angular/router'
import { optimizeImage } from '../helpers/cloudinary'

@Component({
    selector: 'app-grid-list',
    templateUrl: './grid-list.component.html',
    styleUrls: ['./grid-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GridListComponent {

    @Input() itemLimit: number;
    @Input() path: string;
    @Input() model: string;
    @Input() items: Array<any>;
    @Input() titleCard: boolean;
    @Input() centerTitle: boolean;
    @Input() repCard: boolean;
    @Input() centerCards: boolean;

    handleImageUrl = optimizeImage;

    constructor(private router: Router, public dialog: MatDialog, public auth: AuthenticationService) { }

    getItems() {
        let newItems = this.items.slice()

        if (this.itemLimit) {
            newItems = newItems
                .filter((item: any, index: number) => index < this.itemLimit)
                .sort((a: any, b: any) => b.solutionMetaData.totalTrendingScore - a.solutionMetaData.totalTrendingScore)
        }

        return newItems
    }

    trackByFn(index: any, item: any) {
        return index || item.id // or item.id
    }
}
