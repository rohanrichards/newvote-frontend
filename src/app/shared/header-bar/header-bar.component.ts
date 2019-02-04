import { Component, OnInit, Input } from '@angular/core';

import { AuthenticationService } from '@app/core/authentication/authentication.service';

export interface IButtonTemplate {
	text: string;
	color: string;
	routerLink: string;
}

@Component({
	selector: 'app-header-bar',
	templateUrl: './header-bar.component.html',
	styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent implements OnInit {

	@Input() title: string;
	@Input() text: string;
	@Input() buttons: Array<IButtonTemplate>;
	@Input() object: any;

	constructor(public auth: AuthenticationService) { }

	ngOnInit() { }

}
