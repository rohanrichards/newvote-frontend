import { Component, OnInit, AfterViewInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
	selector: 'app-more-less',
	templateUrl: './more-less.component.html',
	styleUrls: ['./more-less.component.scss']
})
export class MoreLessComponent implements OnInit, AfterViewInit {

	@Input() maxHeight: string;
	@Input() displayText: string;
	@ViewChild('spanContainer') spanContainer: ElementRef;
	@ViewChild('fadeContainer') fadeContainer: ElementRef;
	@ViewChild('buttonContainer') buttonContainer: ElementRef;

	public showing = false;
	public shrunk = false;

	constructor(
		private el: ElementRef
	) { }

	ngOnInit() { }

	ngAfterViewInit(): void {
		const rect = this.el.nativeElement.getBoundingClientRect();
		const currentHeight = rect.height;

		if (currentHeight > this.maxHeight) {
			this.spanContainer.nativeElement.style.maxHeight = this.maxHeight + 'px';
			this.fadeContainer.nativeElement.style.display = 'block';
			this.buttonContainer.nativeElement.style.display = 'block';
		} else {
			this.fadeContainer.nativeElement.style.display = 'none';
			this.buttonContainer.nativeElement.style.display = 'none';
		}
	}

	onToggleShow() {
		this.showing = !this.showing;

		if (this.showing) {
			this.spanContainer.nativeElement.style.maxHeight = 'inherit';
		} else {
			this.spanContainer.nativeElement.style.maxHeight = this.maxHeight + 'px';
		}
	}
}
