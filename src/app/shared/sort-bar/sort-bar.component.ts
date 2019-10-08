import { Component, OnInit, Input } from '@angular/core';
import { SortingService } from '@app/core/http/sorting/sorting.service';

@Component({
    selector: 'app-sort-bar',
    templateUrl: './sort-bar.component.html',
    styleUrls: ['./sort-bar.component.scss']
})
export class SortBarComponent implements OnInit {

    sort: string = 'SHOW_ALL';
    order: string = 'ASCENDING';

    orderOptions = [{
        value: 'SHOW_ALL',
        display: 'None'
    }, {
        value: 'VOTES',
        display: 'Votes'
    }, {
        value: 'ACTIONS',
        display: 'Actions'
    }, {
        value: 'TITLE',
        display: 'Title'
    }]

    @Input() model: string;

    constructor(private sortService: SortingService) { }

    ngOnInit() {
    }

    handleSort(event: any) {
        const { value } = event;
        this.sortService.sortEntityBy(this.model, value);
    }

    handleOrder(order: string) {
        this.sortService.orderEntityBy(this.model, order);
    }

    toggleOrder() {
        this.order = this.order === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING';
        this.handleOrder(this.order);
    }
}
