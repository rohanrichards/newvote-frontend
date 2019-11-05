import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { MatAutocomplete, MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { finalize } from 'rxjs/operators'
import { merge } from 'lodash'

import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { SearchService } from '@app/core/http/search/search.service'
import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'

import { Suggestion } from '@app/core/models/suggestion.model'
import { Organization } from '@app/core/models/organization.model'
import { OrganizationQuery } from '@app/core/http/organization/organization.query'
import { SuggestionQuery } from '@app/core/http/suggestion/suggestion.query'

import { cloneDeep } from 'lodash'

@Component({
    selector: 'app-suggestion',
    templateUrl: './suggestion-edit.component.html',
    styleUrls: ['./suggestion-edit.component.scss']
})
export class SuggestionEditComponent implements OnInit {

    suggestion: Suggestion;
    organization: Organization;
    mediaList: Array<string> = [];
    separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    isLoading = true;

    suggestionForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        type: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        statements: new FormControl(''),
        media: new FormControl(''),
        parent: new FormControl(''),
        parentType: new FormControl(''),
        parentTitle: new FormControl('')
    });

    @ViewChild('parentInput', { static: false }) parentInput: ElementRef<HTMLInputElement>;
    @ViewChild('mediaInput', { static: true }) mediaInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

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
        private suggestionQuery: SuggestionQuery
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
        this.suggestionQuery.getSuggestionWithSlug(id)
            .subscribe(
                (suggestion: Suggestion[]) => {
                    if (!suggestion.length) return false
                    this.suggestion = suggestion[0]
                    this.updateForm(suggestion[0])
                    this.updateTags(suggestion[0])
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

    updateForm(suggestion: Suggestion) {
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

    updateTags(suggestion: Suggestion) {
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
                    this.openSnackBar('Succesfully updated', 'OK')
                    this.router.navigate([`/suggestions/${t._slug || t._id}`])
                },
                (error) => this.openSnackBar(`Something went wrong: ${error.status} - ${error.statusText}`, 'OK')
            )
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 4000,
            horizontalPosition: 'right'
        })
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
