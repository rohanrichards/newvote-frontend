import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

import { AuthenticationService } from '@app/core/authentication/authentication.service';

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
	@Output() delete = new EventEmitter();
	@Output() vote = new EventEmitter();
	@Output() childVote = new EventEmitter();

	// Radar
	public chartLabels: string[] = ['For', 'Against'];
	public pieChartType = 'pie';
	public chartColors = [
		{
			backgroundColor: ['rgba(0,255,0,0.8)', 'rgba(255,0,0,0.8)'],
			pointBackgroundColor: ['rgba(0,255,0,0.5)', 'rgba(255,0,0,0.5)'],
			pointHoverBackgroundColor: ['rgba(77,83,96,1)', 'rgba(255,0,0,0.6)'],
			borderColor: ['rgba(77,83,96,1)', 'rgba(255,0,0,0.6)'],
			pointBorderColor: ['#fff', 'rgba(255,0,0,0.6)'],
			pointHoverBorderColor: ['rgba(77,83,96,0.8)', 'rgba(255,0,0,0.6)']
		}
	];
	public chartOptions = {
		elements: {
			arc: {
				borderWidth: 0
			}
		},
		responsive: true,
		legend: {
			display: false
		}
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
				message: `Are you sure you want to delete ${item.name}? This action cannot be undone.`
			}
		});

		dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				this.delete.emit(item);
			}
		});
	}

	onVote(event: any) {
		this.vote.emit(event);
	}

	onChildVote(event: any) {
		this.childVote.emit(event);
	}
}
