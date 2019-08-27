import { Component, OnInit, Input } from '@angular/core';

import { AuthenticationService } from '@app/core/authentication/authentication.service';

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
export class HeaderBarComponent implements OnInit {

	@Input() headerTitle: string;
	@Input() headerText: string;
	@Input() buttons: Array<IButtonTemplate>;
	@Input() object: any;

	constructor(public auth: AuthenticationService) { }

	ngOnInit() { }

}
