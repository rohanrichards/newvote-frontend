import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

import { AuthenticationService } from '@app/core/authentication/authentication.service';
import { createUrl } from '@app/shared/helpers/cloudinary';

@Component({
	selector: 'app-card-list',
	templateUrl: './card-list.component.html',
	styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {

	@Input() path: string;
	@Input() model: string;
	@Input() items: Array<any>;
	@Input() showChildren = false;
	@Input() childPath: string;
	@Input() childName: string;
	@Input() showParent = false;
	@Input() parentPath: string;
	@Input() parentPropName: string;
	@Input() isError: boolean;
	@Output() restore = new EventEmitter();
	@Output() softDelete = new EventEmitter();
	@Output() delete = new EventEmitter();
	@Output() vote = new EventEmitter();
	@Output() childVote = new EventEmitter();

	constructor(public dialog: MatDialog, private auth: AuthenticationService) { }

	ngOnInit() {
	}

	onDelete(item: any, event: any) {
		event.stopPropagation();

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete ${this.model}`,
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
				title: `Remove ${this.model}?`,
				message: `Are you sure you want to remove ${item.name}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.softDelete.emit(item);
			}
		});
	}

	onVote(event: any) {
		this.vote.emit(event);
	}

	onChildVote(event: any) {
		this.childVote.emit(event);
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

	replaceImageUrl (url: string, child?: boolean) {
		if (!url) {
			return '';
		}

		if (url.includes('assets')) {

			if (child) {
				return '';
			}

			return url;
		}

		return createUrl(url, 'auto', 'auto');
	}

	imageToPlaceholder(url: string, child?: boolean) {
		if (!url) {
			return '';
		}

		// For child cards
		if (url.includes('assets')) {

			if (child) {
				return '';
			}

			return url;
		}

 		return createUrl(url, 'low', 'auto');
	}
}
