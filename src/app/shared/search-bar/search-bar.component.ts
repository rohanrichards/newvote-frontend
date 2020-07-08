import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { FormControl } from '@angular/forms'
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs'
import { switchMap, debounceTime, distinctUntilChanged, map } from 'rxjs/operators'

import { SearchService } from '@app/core/http/search/search.service'
import { CommunityQuery } from '@app/core/http/organization/organization.query'
import { IOrganization } from '@app/core/models/organization.model'

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
    @Input() isVisible = false;
    @Input() error = false;
    @Input() communitySearch = false
    @Output() isVisibleChange = new EventEmitter<boolean>();
    @Output() closeSearch = new EventEmitter();

    @ViewChild('searchInputElement') searchInputElement: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    searchInputControl = new FormControl('', []);
    public searchResults$: Observable<any>;

    constructor(
        private searchService: SearchService,
        private router: Router,
        private communityQuery: CommunityQuery
    ) { }

    ngOnInit() {

        if (this.communitySearch) {
            this.searchResults$ = this.searchInputControl.valueChanges
                .pipe(debounceTime(300),
                    distinctUntilChanged(),
                    switchMap(
                        (query: string) => {
                            if (query !== '') {
                                return this.communityQuery.selectAll()
                                    .pipe(
                                        map((res: any) => {
                                            return res
                                                .map((org: any) => {
                                                    // Objects from Akita store are frozen - need to create
                                                    // new object copy in order to mutate, i.e add Schema for search results
                                                    return Object.assign({}, org, {
                                                        schema: 'Organization'
                                                    })
                                                })
                                                .filter((org: any) => {
                                                    return org.name.toLowerCase().includes(query.toLowerCase())
                                                })
                                        })
                                    )
                            } else {
                                return of([])
                            }
                        }
                    ))
        } else {
            this.searchResults$ = this.searchInputControl.valueChanges
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap(
                        (query: string) => {
                            if (query !== '') {
                                return this.searchService.all({ query })
                            } else {
                                return of([])
                            }
                        }
                    )
                )
        }

    }

    searchSelected(event: any) {
        const item = event.option.value
        const model = item.schema
        const url = `/${model.toLowerCase()}s/${item._id}`

        if (this.communitySearch) {
            const { hostname } = window.location
            // separate the current hostname into subdomain and main site
            const splitHostname = hostname.split('.')
            splitHostname[0] = item.url

            const newHostName = splitHostname.join('.')
            window.location.href = `http://${newHostName}:${window.location.port}` 
        }

        this.searchInputControl.setValue('')
        this.isVisible = false
        this.isVisibleChange.emit(false)
        this.closeSearch.emit()
        this.router.navigate([url])
    }

    onSearchClose(event: any) {
        event.preventDefault()
        this.closeSearch.emit()
    }
}
