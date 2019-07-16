import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { createUrl } from '../helpers/cloudinary';
import { Router } from '@angular/router';

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

	constructor(private router: Router, public dialog: MatDialog, private auth: AuthenticationService) { }

	public get getItems() {

		if (this.itemLimit) {
			return this.items
				.filter((item: any, index: Number) => index < this.itemLimit)
				.sort((a: any, b: any) => b.solutionMetaData.totalTrendingScore - a.solutionMetaData.totalTrendingScore);
		}

		return this.items;
	}

	ngOnInit() { }

	onDelete(item: any, event: any) {
		event.stopPropagation();

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete ${this.model} Forever`,
				message: `Are you sure you want to delete ${item.name}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.delete.emit(item);
			}
		});
	}

	onSoftDelete(item: any, event: any) {
		event.stopPropagation();

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete ${this.model}`,
				message: `Are you sure you want to delete ${item.name}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.softDelete.emit(item);
			}
		});
	}

	onRestore(item: any, event: any) {
		event.stopPropagation();

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Restore ${this.model}`,
				message: `Are you sure you want to restore ${item.name}? This will make the item visible to the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.restore.emit(item);
			}
		});
	}

	replaceImageUrl (url: string) {
		if (!url) {
			return '';
		}

		return createUrl(url, 'auto', 'auto');
	}

	imageToPlaceholder(url: string) {
		if (!url) {
			return '';
		}

 		return createUrl(url, 'low', 'auto');
	}

	handleUrl (item: any) {

		if (this.model !== 'Organization') {
			return this.router.navigate([`/${this.path}/${item._id}`]);
		}

		const { hostname } = window.location;

		// separate the current hostname into subdomain and main site
		const splitHostname = hostname.split('.');
		splitHostname[0] = item.url;

		const newHostName = splitHostname.join('.');
		window.location.href = `http://${newHostName}:4200`;
	}

}
