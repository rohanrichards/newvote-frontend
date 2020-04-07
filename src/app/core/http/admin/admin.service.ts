import { Injectable } from '@angular/core'
import { SuggestionService } from '../suggestion/suggestion.service'
import { SolutionService } from '../solution/solution.service'
import { IssueService } from '../issue/issue.service'
import { ProposalService } from '../proposal/proposal.service'
import { MediaService } from '../media/media.service'
import { OrganizationService } from '../organization/organization.service'
import { assign } from 'lodash'
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material'
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component'
import { IIssue } from '@app/core/models/issue.model'
import { IMedia } from '@app/core/models/media.model'
import { IOrganization } from '@app/core/models/organization.model'
import { ISolution } from '@app/core/models/solution.model'
import { ISuggestion } from '@app/core/models/suggestion.model'
import { IProposal } from '@app/core/models/proposal.model'
import { TopicService } from '../topic/topic.service'
import { ITopic } from '@app/core/models/topic.model'
import { Router } from '@angular/router'
import { IRep } from '@app/core/models/rep.model'
import { RepService } from '../rep/rep.service'
import { ToastService } from '@app/core/toast/toast.service'

type Entities = {
    Topic: ITopic;
    Issue: IIssue;
    Suggestion: ISuggestion;
    Solution: ISolution;
    Proposal: IProposal;
    Media: IMedia;
    Organization: IOrganization;
    Rep: IRep;
}
type Services = {
    Topic: TopicService;
    Issue: IssueService;
    Suggestion: SuggestionService;
    Solution: SolutionService;
    Proposal: ProposalService;
    Media: MediaService;
    Organization: OrganizationService;
    Rep: RepService;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    MAX_LENGTH = 40;
    services: Services = {
        Topic: this.topicService,
        Issue: this.issueService,
        Suggestion: this.suggestionService,
        Solution: this.solutionService,
        Proposal: this.proposalService,
        Media: this.mediaService,
        Organization: this.organizationService,
        Rep: this.repService,
    }

    constructor(
        private organizationService: OrganizationService,
        private issueService: IssueService,
        private solutionService: SolutionService,
        private suggestionService: SuggestionService,
        private proposalService: ProposalService,
        private mediaService: MediaService,
        private topicService: TopicService,
        private dialog: MatDialog,
        private router: Router,
        private repService: RepService,
        private toast: ToastService,
    ) { }

    getTitle(object: any, model: string): string {
        if (model === 'Issue' || model === 'Topic' || model === 'Organization') {
            return object.name.length < this.MAX_LENGTH ?
                object.name
                : object.name.slice(0, this.MAX_LENGTH) + '...'
        }

        if (model === 'Rep') {
            return model
        }

        return object.title.length < this.MAX_LENGTH ?
            object.title
            : object.title.slice(0, this.MAX_LENGTH) + '...'
    }

    createEntity(data: any, model: string, softDelete: boolean) {
        // switch (model) {
        //     case 'Topic':
        //         return new Topic(object)
        //     case 'Issue':
        //         return new Issue(object)
        //     case 'Solution':
        //         return new Solution(object)
        //     case 'Proposal':
        //         return new Proposal(object)
        //     case 'Media':
        //         return new Media(object)
        //     case 'Organization':
        //         return new Organization(object)
        // }
    }

    onDelete(object: any, model: string, redirectRoute?: string) {
        const title: string = this.getTitle(object, model)

        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            width: '250px',
            data: {
                title: `Delete ${model}?`,
                message: `Are you sure you want to delete ${title}? This action cannot be undone.`
            }
        })

        dialogRef.afterClosed().subscribe((confirm: boolean) => {
            if (confirm) {
                const data = { id: object._id }
                const service = this.services[model].delete(data)

                service.subscribe(
                    () => {
                        this.toast.openSnackBar('Succesfully deleted', 'OK')
                        if (redirectRoute) {
                            this.router.navigate([`/${redirectRoute}`])
                        }
                    },
                    (err: any) => err
                )
            }
        })

    }

    onSoftDelete(object: any, model: string, redirectRoute?: string) {
        const title: string = this.getTitle(object, model)

        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            width: '250px',
            data: {
                title: `Remove ${title}?`,
                message: `Are you sure you want to remove ${title}? This will only hide the item from the public.`
            }
        })

        dialogRef.afterClosed().subscribe((confirm: boolean) => {
            if (confirm) {

                const entity = assign({}, object, { softDeleted: true })
                const service = this.services[model].update({ id: entity._id, entity })

                service.subscribe(
                    () => {
                        this.toast.openSnackBar('Succesfully removed', 'OK')

                        if (redirectRoute) {
                            this.router.navigate([`/${redirectRoute}`])
                        }
                    },
                    (err: any) => err
                )
            }
        })

    }

    onRestore(object: any, model: string, redirectRoute?: string) {
        const title: string = this.getTitle(object, model)

        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            width: '250px',
            data: {
                title: `Restore ${title}?`,
                message: `Are you sure you want to restore ${title}? This will make the item visible to the public.`
            }
        })

        dialogRef.afterClosed().subscribe((confirm: boolean) => {
            if (confirm) {
                const entity = assign({}, object, { softDeleted: false })
                const service = this.services[model].update({ id: entity._id, entity })

                service.subscribe(
                    () => {
                        this.toast.openSnackBar('Succesfully restored', 'OK')

                        if (redirectRoute) {
                            this.router.navigate([`/${redirectRoute}`])
                        }
                    },
                    (err: any) => err
                )
            }
        })
    }
}
