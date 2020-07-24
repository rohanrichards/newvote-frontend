import { Injectable } from '@angular/core'
import { SuggestionService } from '../suggestion/suggestion.service'
import { SolutionService } from '../solution/solution.service'
import { IssueService } from '../issue/issue.service'
import { ProposalService } from '../proposal/proposal.service'
import { MediaService } from '../media/media.service'
import { OrganizationService } from '../organization/organization.service'
import { assign } from 'lodash'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component'
import { Issue, IIssue } from '@app/core/models/issue.model'
import { Media, IMedia } from '@app/core/models/media.model'
import { Organization, IOrganization } from '@app/core/models/organization.model'
import { Solution, ISolution } from '@app/core/models/solution.model'
import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model'
import { Proposal, IProposal } from '@app/core/models/proposal.model'
import { TopicService } from '../topic/topic.service'
import { Topic, ITopic } from '@app/core/models/topic.model'
import { Router } from '@angular/router'
import { IRep } from '@app/core/models/rep.model'
import { RepService } from '../rep/rep.service'
import { NotificationService } from '../notifications/notification.service'

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
    Notification: NotificationService;
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
        Notification: this.notificationService
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
        private snackBar: MatSnackBar,
        private router: Router,
        private repService: RepService,
        private notificationService: NotificationService
    ) { }

    getTitle(object: any, model: string): string {
        if (model === 'Issue' || model === 'Topic' || model === 'Organization') {
            return object.name.length < this.MAX_LENGTH ?
                object.name
                : object.name.slice(0, this.MAX_LENGTH) + '...'
        }

        if (model === 'Rep' || model === 'Notification') {
            return model
        }

        return object.title.length < this.MAX_LENGTH ?
            object.title
            : object.title.slice(0, this.MAX_LENGTH) + '...'
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
                        this.openSnackBar('Succesfully deleted', 'OK')
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
                        this.openSnackBar('Succesfully removed', 'OK')

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
                        this.openSnackBar('Succesfully restored', 'OK')

                        if (redirectRoute) {
                            this.router.navigate([`/${redirectRoute}`])
                        }
                    },
                    (err: any) => err
                )
            }
        })
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
        })
    }
}
