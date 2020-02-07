import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatChipInputEvent } from '@angular/material';
import { DialogData } from '../confirm-dialog/confirm-dialog.component';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

@Component({
    selector: 'app-rep-modal',
    templateUrl: './rep-modal.component.html',
})
export class RepModalComponent implements OnInit {
    repEmail: string;
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    value: string;

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

    add(): void {
        const { value } = this
        let { representativeTags } = this.data

        console.log(representativeTags, 'this is representativeTags on add')
        const tag = {
            name: value.trim(),
            color: 'primary'
        }
        // Add our fruit
        if ((value || '').trim()) {
            representativeTags = [...representativeTags, tag];
            this.data.representativeTags = representativeTags
        }
        this.value = ''
    }

    remove(tag: any): void {
        let { representativeTags } = this.data
        const index = representativeTags.findIndex((item: any) => {
            return item.name === tag.name
        })

        if (index >= 0) {
            representativeTags = [...representativeTags.splice(0, index), ...representativeTags.splice(index+1, representativeTags.length -1)]
            this.data.representativeTags = representativeTags
        }

    }
}
