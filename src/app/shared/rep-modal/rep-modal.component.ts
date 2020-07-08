import { Component, OnInit, Inject } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

        const repArray = [...newReps, { name: repEmail, tags: []}]
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
        // 1) filter from the currentReps array, the item to be deleted
        // 2) populate removeReps array with removed item to send to API
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

        const tag = {
            name: value.trim(),
            color: 'primary'
        }
        // Add our fruit
        if ((value || '').trim()) {
            this.data.tagsUpdated = true
            representativeTags = [...representativeTags, tag];
            this.data.representativeTags = representativeTags
        }
        this.value = ''
    }

    remove(tag: any): void {
        const { representativeTags } = this.data
        const index = representativeTags.findIndex((item: any) => {
            return item.name === tag.name
        })

        if (index >= 0) {
            const newRepTags = [...representativeTags.slice(0, index), ...representativeTags.slice(index+1, representativeTags.length)]
            this.data.representativeTags = newRepTags
            this.data.tagsUpdated = true
        }

    }

    updateRepTag(repObj: any) {
        const { newReps, currentReps } = this.data
        const reps = repObj.isNewRep ? newReps : currentReps
        const rep = reps.find((item: any) => {
            return item._id === repObj.rep._id
        })

        rep.tags = repObj.tags
    }
}
