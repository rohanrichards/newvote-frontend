import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSelectChange } from '@angular/material';

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

  selectedTags: any[];
  constructor() { }

  ngOnInit() {
      this.selectedTags = this.rep.tags
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
