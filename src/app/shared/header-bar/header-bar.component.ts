import { Component, OnInit, Input } from '@angular/core';

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

	constructor() { }

	ngOnInit() { }

}
