import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { Proposal } from '@app/core/models/proposal.model'
import { ProposalStore, ProposalState } from './proposal.store'
import { AuthenticationQuery } from '@app/core/authentication/authentication.query'

@Injectable()
export class ProposalQuery extends QueryEntity<ProposalState, Proposal> {
    proposals$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isModerator()) {
                return true
            }

            return !entity.softDeleted
        }
    })

    constructor(
        protected store: ProposalStore,
        private auth: AuthenticationQuery
    ) {
        super(store)
    }

    getProposalWithSlug(id: string) {
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/)
        return this.selectAll({
            filterBy: (entity: Proposal) => isObjectId ? entity._id === id : entity.slug === id
        })
    }

    filterBySolutionId(id: string) {
        return this.selectAll({
            filterBy: (entity) => {
                const includesSolutionId = entity.solutions.some((solution: any) => {
                    // newly created proposals will return with a solutions array with just the object id
                    // instead of populated object
                    if (typeof solution === 'string') {
                        return solution === id
                    }

                    return solution._id === id
                })

                return includesSolutionId
            }
        })
    }
}
