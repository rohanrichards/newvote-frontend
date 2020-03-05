import { Component, OnInit, Input } from '@angular/core';
import { IOrganization } from '@app/core/models/organization.model';
import { Issue } from '@app/core/models/issue.model';
import { Solution } from '@app/core/models/solution.model';
import { Proposal } from '@app/core/models/proposal.model';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';

@Component({
    selector: 'app-home-info-panel',
    templateUrl: './home-info-panel.component.html',
    styleUrls: ['./home-info-panel.component.scss']
})
export class HomeInfoPanelComponent implements OnInit {
  @Input() org: IOrganization
  @Input() issues: Issue[];
  @Input() solutions: Solution[];
  @Input() proposals: Proposal[];
  @Input() userCount: number;

  constructor(public auth: AuthenticationQuery) { }

  ngOnInit() {
  }

  handleUserCount(count: number) {
      if (this.auth.isAdmin() || this.auth.isOwner()) {
          return `${count}`
      }

      if (!count) {
          return '0'
      }

      if (count < 1000) {
          return '< 1K'
      }

      return `${Math.floor(count / 1000)}K+`
  }
}
