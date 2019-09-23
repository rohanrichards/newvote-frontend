import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { Router } from '@angular/router';
import { optimizeImage } from '../helpers/cloudinary';

@Component({
	selector: 'app-grid-list',
	templateUrl: './grid-list.component.html',
	styleUrls: ['./grid-list.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class GridListComponent implements OnInit {

	@Input() path: string;
	@Input() model: string;
	@Input() items: Array<any>;
	@Input() itemLimit: Number;
	@Input() titleCard: boolean;
	@Output() delete = new EventEmitter();
	@Output() softDelete = new EventEmitter();
	@Output() restore = new EventEmitter();
	handleImageUrl = optimizeImage;

	constructor(private router: Router, public dialog: MatDialog, private auth: AuthenticationService) { }

	getItems() {
		let newItems = this.items.slice();

		if (this.itemLimit) {
			newItems = newItems
				.filter((item: any, index: Number) => index < this.itemLimit)
				.sort((a: any, b: any) => b.solutionMetaData.totalTrendingScore - a.solutionMetaData.totalTrendingScore);
		}

		return newItems;
	}

	ngOnInit() { }

	onDelete(item: any, event: any) {
		event.stopPropagation();
		this.delete.emit(item);
	}

	onSoftDelete(item: any, event: any) {
		event.stopPropagation();
		this.softDelete.emit(item);
	}

	onRestore(item: any, event: any) {
		event.stopPropagation();
		this.restore.emit(item);
	}

	handleUrl(item: any) {

		if (this.model !== 'Organization') {
			return this.router.navigate([`/${this.path}/${item._id}`]);
		}

		const { hostname } = window.location;

		// separate the current hostname into subdomain and main site
		const splitHostname = hostname.split('.');
		splitHostname[0] = item.url;

		const newHostName = splitHostname.join('.');
		window.location.href = `http://${newHostName}:${window.location.port}`;
	}

	trackByFn(index: any, item:any) {
		return index; // or item.id
	  }
}
