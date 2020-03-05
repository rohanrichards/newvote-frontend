import { Component, Input } from '@angular/core'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { AccessControlQuery } from '@app/core/http/mediators/access-control.query';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';

export interface IButtonTemplate {
    text: string;
    color: string;
    routerLink: string;
    params: any;
}

@Component({
    selector: 'app-header-bar',
    templateUrl: './header-bar.component.html',
    styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent {

    @Input() headerTitle: string;
    @Input() headerText: string;
    @Input() buttons: Array<IButtonTemplate>;
    @Input() object: any;

    constructor(
        public auth: AuthenticationQuery,
        public access: AccessControlQuery
    ) { }

}
