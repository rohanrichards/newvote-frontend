import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-rep-modal',
    templateUrl: './rep-modal.component.html',
})
export class RepModalComponent implements OnInit {
    repEmail: string;

    constructor(
        public dialogRef: MatDialogRef<RepModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
    }

    addRep() {
        const { newReps = [], repEmail } = this.data

        let repArray = [...newReps, repEmail]
        this.data.newReps = repArray
        this.data.repEmail = ''
    }

}
