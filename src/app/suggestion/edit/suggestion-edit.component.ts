import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { finalize } from 'rxjs/operators'
import { merge } from 'lodash'

import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { SearchService } from '@app/core/http/search/search.service'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'

import { Suggestion, ISuggestion } from '@app/core/models/suggestion.model'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'

import { cloneDeep } from 'lodash'
import { EntityVotesQuery } from '@app/core/http/mediators/entity-votes.query'
import { AdminService } from '@app/core/http/admin/admin.service'

@Component({
    selector: 'app-suggestion',
    templateUrl: './suggestion-edit.component.html',
    styleUrls: ['./suggestion-edit.component.scss']
})
export class SuggestionEditComponent implements OnInit {

    suggestion: ISuggestion;
    organization: Organization;
    mediaList: Array<string> = [];
    separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    isLoading = true;

    suggestionForm = new FormGroup({
        title: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        type: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        statements: new FormControl(''),
        media: new FormControl(''),
        parent: new FormControl(''),
        parentType: new FormControl(''),
        parentTitle: new FormControl('')
    });

    @ViewChild('parentInput') parentInput: ElementRef<HTMLInputElement>;
    @ViewChild('mediaInput', { static: true }) mediaInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(
        private suggestionService: SuggestionService,
        private organizationService: OrganizationService,
        private searchService: SearchService,
        private location: Location,
        public snackBar: MatSnackBar,
        private route: ActivatedRoute,
        private router: Router,
        private meta: MetaService,
        private organizationQuery: OrganizationQuery,
        private suggestionQuery: SuggestionQuery,
        private entityVotes: EntityVotesQuery,
        private admin: AdminService
    ) { }

    ngOnInit() {
        this.subscribeToOrganizationStore()
        this.isLoading = true
        this.route.paramMap.subscribe(params => {
            const ID = params.get('id')
            this.subscribeToSuggestionStore(ID)
            this.suggestionService.view({ id: ID })
                .pipe(finalize(() => { this.isLoading = false }))
                .subscribe(
                    (res) => res,
                    (err) => err
                )
        })

    }

    subscribeToSuggestionStore(id: string) {
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/)
        const key = isObjectId ? '_id' : 'slug'
        this.entityVotes.getManySuggestions(id, key)
            .subscribe(
                (suggestions: ISuggestion[]) => {
                    if (!suggestions.length) return false
                    const [suggestion, ...rest] = suggestions
                    this.suggestion = suggestion
                    this.updateForm(suggestion)
                    this.updateTags(suggestion)
                },
                (err) => err
            )
    }

    subscribeToOrganizationStore() {
        this.organizationQuery.select()
            .subscribe(
                (organization: Organization) => { this.organization = organization },
                (err) => err
            )
    }

    updateForm(suggestion: ISuggestion) {
        this.mediaList = suggestion.media

        this.suggestionForm.patchValue({
            title: suggestion.title,
            type: suggestion.type || '',
            description: suggestion.description,
            parent: suggestion.parent,
            parentTitle: suggestion.parentTitle,
            parentType: suggestion.parentType
        })
    }

    updateTags(suggestion: ISuggestion) {
        this.meta.updateTags(
            {
                title: `Edit ${suggestion.title}`,
                appBarTitle: 'Edit Suggestion',
                description: `${suggestion.description}`
            })
    }

    onSave() {
        this.isLoading = true

        const suggestion = cloneDeep(this.suggestion)
        merge(suggestion, this.suggestionForm.value as Suggestion)
        suggestion.organizations = this.organization
        suggestion.media = this.mediaList

        this.suggestionService.update({ id: suggestion._id, entity: suggestion })
            .pipe(finalize(() => { this.isLoading = false }))
            .subscribe(
                (t) => {
                    this.admin.openSnackBar('Succesfully updated', 'OK')
                    this.router.navigate([`/suggestions/${t._slug || t._id}`])
                },
                (error) => this.admin.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            )
    }

    // imported data from query is read only, so need to copy / replace
    // array on each update
    mediaAdded(event: any) {
        if (event.value) {
            const mediaList = [...this.mediaList, event.value]
            this.mediaList = mediaList
            this.mediaInput.nativeElement.value = ''
        }
    }

    mediaRemoved(media: any) {
        const mediaList = [...this.mediaList]
        const index = mediaList.indexOf(media)
        if (index > -1) {
            mediaList.splice(index, 1)
            this.mediaList = mediaList
        }
    }

}
