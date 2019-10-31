import { Component, OnInit } from '@angular/core'
import { FeedService } from '@app/core/http/feed'

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {

    constructor(private feedService: FeedService) { }

    ngOnInit() {
    }

    updateProgress(state: string) {
        console.log(state, 'this is state')
        // this.feedService.update(state);
    }
}
