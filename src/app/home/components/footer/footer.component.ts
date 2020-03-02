import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';
import { IOrganization } from '@app/core/models/organization.model';
import { AuthenticationService } from '@app/core/authentication/authentication.service';

@Component({
  selector: 'app-home-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @Input() org: IOrganization;
  // TODO: Update service isAuthenticated & JWT check to query
  constructor(public auth: AuthenticationService) { }

  ngOnInit() {
  }

}
