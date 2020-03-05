import { Component, OnInit, Input } from '@angular/core';
import { IOrganization } from '@app/core/models/organization.model';

@Component({
  selector: 'app-community-card',
  templateUrl: './community-card.component.html',
  styleUrls: ['./community-card.component.scss']
})
export class CommunityCardComponent implements OnInit {
  @Input() organization: IOrganization;
  
  constructor() { }

  ngOnInit() {
  }

}
