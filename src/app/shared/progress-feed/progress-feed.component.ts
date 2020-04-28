import { Component, OnInit, Input } from '@angular/core'

@Component({
    selector: 'app-progress-feed',
    templateUrl: './progress-feed.component.html',
    styleUrls: ['./progress-feed.component.scss']
})
export class ProgressFeedComponent implements OnInit {

    @Input() feedItems: Array<any> = ['one', 'two', 'three'];
    constructor() { }

    ngOnInit() {
    }

}
