import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { SwiperComponent, SwiperConfigInterface, SwiperPaginationInterface } from 'ngx-swiper-wrapper';

import { AuthenticationService } from '@app/core/authentication/authentication.service';

@Component({
	selector: 'app-swiper-wrapper',
	templateUrl: './swiper-wrapper.component.html',
	styleUrls: ['./swiper-wrapper.component.scss']
})
export class SwiperWrapperComponent implements OnInit {
	@ViewChild(SwiperComponent) componentRef?: SwiperComponent;
	@Input() path: string;
	@Input() model: string;
	@Input() items: Array<any>;
	@Output() delete = new EventEmitter();
	@Output() vote = new EventEmitter();
	@Output() softDelete = new EventEmitter();

	public config: SwiperConfigInterface = {
		a11y: true,
		effect: 'coverflow',
		direction: 'horizontal',
		centeredSlides: true,
		slidesPerView: 3,
		spaceBetween: 40,
		keyboard: true,
		mousewheel: false,
		scrollbar: false,
		navigation: true,
		pagination: false,
		observer: true,
		observeParents: true,
		loop: false,
		initialSlide: 0,
		roundLengths: true,
		breakpoints: {
			// when window width is <= 480px
			480: {
				slidesPerView: 1,
				spaceBetween: 10
			},
			// when window width is <= 640px
			1280: {
				slidesPerView: 2,
				spaceBetween: 30
			}
		}
	};

	private pagination: SwiperPaginationInterface = {
		el: '.swiper-pagination',
		clickable: true,
		hideOnClick: false
	};

	constructor(public dialog: MatDialog, private auth: AuthenticationService) { }

	ngOnInit() {
	}

	onDelete(item: any, event: any) {
		event.stopPropagation();

		const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
			width: '250px',
			data: {
				title: `Delete ${this.model}`,
				message: `Are you sure you want to delete ${item.title}? This action cannot be undone.`
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
				title: `Remove ${this.model}`,
				message: `Are you sure you want to remove ${item.title}? This will only hide the item from the public.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.softDelete.emit(item);
			}
		});
	}

	onVote(item: any, voteValue: number, event: any) {
		this.vote.emit({item, voteValue});
	}
}
