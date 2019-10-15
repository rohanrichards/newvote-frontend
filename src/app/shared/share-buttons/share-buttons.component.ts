import { Component, OnInit, Input, Inject } from '@angular/core'
import { PlatformLocation, Location, DOCUMENT } from '@angular/common'

import { ShareService } from '@ngx-share/core'

@Component({
    selector: 'app-share-buttons',
    templateUrl: './share-buttons.component.html',
    styleUrls: ['./share-buttons.component.scss']
})
export class ShareButtonsComponent implements OnInit {

    constructor(
		@Inject(DOCUMENT) document: any,
		public location: Location,
		public platform: PlatformLocation,
		public share: ShareService
    ) { }

    ngOnInit() { }

    getUrl() {
        return document.location.href
    }

}
