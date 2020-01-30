import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-rep-modal',
    templateUrl: './rep-modal.component.html',
})
export class RepModalComponent implements OnInit {
    repEmail: string;

    // https://github.com/angular/components/issues/15862 - type error when assigning
    // data to MatDialogData
    // set to any or create own type
    constructor(
        public dialogRef: MatDialogRef<RepModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
    }

    addRep() {
        const { newReps = [], repEmail } = this.data

        const repArray = [...newReps, repEmail]
        this.data.newReps = repArray
        this.data.repEmail = ''
    }

    removeNewRep(rep: any) {
        const { newReps = [] } = this.data
        this.data.newReps = newReps.filter((item: any) => {
            return item !== rep
        })
    }

    removeCurrentRep(rep: any) {
        const { currentReps } = this.data

        this.data.currentReps = currentReps.slice()
            .filter((item: any) => {
                if (item._id === rep._id) {
                    this.data.removeReps = [...this.data.removeReps, item]
                }
                return item._id !== rep._id
            })
    }
}
