import { Component, OnInit } from '@angular/core';
import { ProposalQuery } from '@app/core/http/proposal/proposal.query';
import { Proposal } from '@app/core/models/proposal.model';
import { Observable } from 'rxjs';
import { ProposalService } from '@app/core/http/proposal/proposal.service';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';

@Component({
  selector: 'app-reps-list',
  templateUrl: './reps-list.component.html',
  styleUrls: ['./reps-list.component.scss']
})

export class RepsListComponent implements OnInit {
  proposals$: Observable<Proposal[]>
  constructor(
      private proposalQuery: ProposalQuery,
      private proposalService: ProposalService,
      private auth: AuthenticationQuery
  ) { }

  ngOnInit() {
      this.fetchData()
      this.subscribeToProposalStore()
  }

  subscribeToProposalStore() {
      this.proposals$ = this.proposalQuery.selectAll({})
  }

  fetchData() {
      const isModerator = this.auth.isModerator()
      // this.isLoading = true
      const params = { softDeleted: isModerator ? true : '' }

      this.proposalService.list({ orgs: [], params })
          .subscribe(() => true)
  }
}
