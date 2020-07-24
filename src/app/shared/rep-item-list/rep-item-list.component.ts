import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-rep-item-list',
  templateUrl: './rep-item-list.component.html',
  styleUrls: ['./rep-item-list.component.scss']
})
export class RepItemListComponent implements OnInit {
  @Input() rep: any;
  @Input() tags: any[];
  @Input() newRep = false;
  @Output() updateRepTag = new EventEmitter();

  selectedTags: Array<any> = []

  constructor() { }

  ngOnInit() {
      // bug
      // if a tag is removed from organizations, it will persist on a user tags array
      // filter the user tags onload so they do not get display
      const userTags = this.rep.tags.slice().filter((tag: any) => {
          return !!this.tags.find((item: any) => {
              return item.name === tag
          })
      })
      this.selectedTags = [...userTags]
  }

  handleChange(event: MatSelectChange, newRep: boolean) {
      const repObj = {
          rep: this.rep,
          tags: [...event.value],
          isNewRep: newRep
      }
      this.updateRepTag.emit(repObj)
  }

}
