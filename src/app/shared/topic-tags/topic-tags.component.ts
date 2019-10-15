import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-topic-tags',
    templateUrl: './topic-tags.component.html',
    styleUrls: ['./topic-tags.component.scss']
})
export class TopicTagsComponent {

    @Input() topics: Array<any> = [];

}
