import { Component, OnInit, Input } from '@angular/core';
import { IIssue } from '@app/core/models/issue.model';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { AdminService } from '@app/core/http/admin/admin.service';

@Component({
  selector: 'app-issues-panel',
  templateUrl: './issues-panel.component.html',
  styleUrls: ['./issues-panel.component.scss']
})
export class IssuesPanelComponent implements OnInit {
  @Input() issues: IIssue[];
  ISSUE_LIMIT = 6;
  constructor(public auth: AuthenticationQuery, public admin: AdminService) { }

  ngOnInit() {
  }

}
