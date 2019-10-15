import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component'
import { SwiperComponent, SwiperConfigInterface, SwiperPaginationInterface } from 'ngx-swiper-wrapper'

import { AuthenticationService } from '@app/core/authentication/authentication.service'
import { VotesQuery } from '@app/core/http/vote/vote.query'

@Component({
    selector: 'app-swiper-wrapper',
    templateUrl: './swiper-wrapper.component.html',
    styleUrls: ['./swiper-wrapper.component.scss']
})
export class SwiperWrapperComponent implements OnInit {

	@ViewChild(SwiperComponent, { static: false }) componentRef?: SwiperComponent;
	@Input() path: string;
	@Input() model: string;
	@Input() items: Array<any>;
	@Input() parent: string;
	@Input() organization: any;
	@Output() delete = new EventEmitter();
	@Output() vote = new EventEmitter();
	@Output() softDelete = new EventEmitter();
	@Output() restore = new EventEmitter();

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

	constructor(
		public dialog: MatDialog,
		private auth: AuthenticationService,
		private votesQuery: VotesQuery
	) { }

	ngOnInit() {

	}

	onDelete(item: any, event: any) {
	    event.stopPropagation()
	    this.delete.emit(item)
	}

	onSoftDelete(item: any, event: any) {
	    event.stopPropagation()
	    this.softDelete.emit(item)
	}

	onRestore(item: any, event: any) {
	    event.stopPropagation()
	    this.restore.emit(item)
	}

	onVote(item: any, voteValue: number, event: any) {
	    this.vote.emit({ item, voteValue })
	}

	visitUrl(event: any, url: string) {
	    event.preventDefault()
	    // url isn't trimmed on backend - do here so not to get bad urls
	    url = this.setHttp(url.trim())
	    window.open(url, '_blank')
	}

	setHttp(link: string) {
	    if (link.search(/^http[s]?\:\/\//) === -1) {
	        link = 'https://' + link
	    }
	    return link
	}
}
