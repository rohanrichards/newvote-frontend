import { Title } from '@angular/platform-browser'
import {
    Component, OnInit, Output, EventEmitter,
    ViewChild
} from '@angular/core'
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router'
import { MediaObserver } from '@angular/flex-layout'

import { OrganizationService } from '@app/core/http/organization/organization.service'
import { MetaService } from '@app/core/meta.service'
import { MatSidenavContainer } from '@angular/material/sidenav';

import { asyncScheduler } from 'rxjs'
import { filter, observeOn } from 'rxjs/operators'
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay'
import { ScrollService } from '@app/core/scroll/scroll.service'
import { I18nService, AuthenticationService } from '@app/core'

interface ScrollPositionRestore {
    event: Event;
    positions: { [K: number]: number };
    trigger: 'imperative' | 'popstate';
    idToRestore: number;
}

@Component({
    selector: 'app-shell',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
    organization: any;
    hideVerify = false;
    showSearch = false;
    currentRoute: any;
    oldRouteState: any;
    pageLoading = false;

    @Output() closeSearch = new EventEmitter();
    @ViewChild(MatSidenavContainer, { static: true }) sidenavContainer: MatSidenavContainer;

    scrollingSubscription: any;

    constructor(
        public auth: AuthenticationService,
        private scrollService: ScrollService,
        public scroll: ScrollDispatcher,
        private router: Router,
        private titleService: Title,
        private i18nService: I18nService,
        private organizationService: OrganizationService,
        private meta: MetaService,
        private media: MediaObserver
    ) {
        // Subscribe to the route data from service,
        // Due to outlet not reusing routes, multiple instances of the scroll handlers are listened
        // Without service data is saved multiple times
        this.scrollService.currentRoute$
            .subscribe((route: any) => {
                this.currentRoute = route
            })

        // Listen in to the scroll data and update the scroll position on service
        // We save on the service so we can handle multiple scroll listners not copying / resetting
        this.scrollingSubscription = this.scroll
            .scrolled()
            .subscribe((data: CdkScrollable) => {
                const scrollTop = data.getElementRef().nativeElement.scrollTop
                this.scrollService.updateCurrentRoutePosition(scrollTop)
            })

        // NavigationStart/Navigation End router events
        // NavigationStart tells us whether we are navigating forwards or backwards
        // Navigation end saves the current route to the scrollService

        this.router.events
            .pipe(
                filter(
                    event =>
                        event instanceof NavigationStart ||
                        event instanceof NavigationEnd
                ),
            )
            .pipe(
                // https://blog.angularindepth.com/reactive-scroll-position-restoration-with-rxjs-792577f842c
                // delays the navigation events during the lifecycle so scroll position is restored
                observeOn(asyncScheduler)
            )
            .subscribe((e: any) => {
                if (e instanceof NavigationStart) {
                    if (e.navigationTrigger === 'popstate') {
                        // User has hit the back button

                        // Only load old page state once if it exists and is the same as current route
                        if (this.oldRouteState && this.oldRouteState.id === e.restoredState.navigationId) {
                            return false
                        }

                        // If previous page state is not loaded, search the saved page states on service for match
                        // & save page state so the offset can be used once the new route has fully loaded
                        this.oldRouteState = this.scrollService.getSavedRoutes().find((ele: any) => {
                            return e.restoredState.navigationId === ele.id
                        })
                    }

                    // If navigation is not a back click, remove previous page state
                    // so the scroll is not saved going forwards
                    if (e.navigationTrigger === 'imperative') {
                        // User has user the router navigation
                        this.oldRouteState = null
                    }
                }

                // NavigationEnd - only router event that fires on pageLoad
                // saves the current page to service
                if (e instanceof NavigationEnd) {
                    const currentRoute = {
                        id: e.id,
                        route: e.url
                    }

                    this.scrollService.saveRoute(currentRoute)

                    if (!this.oldRouteState) {
                        return this.sidenavContainer.scrollable.scrollTo({ left: 0, top: 0, behavior: 'auto' })
                    }
                    return this.sidenavContainer.scrollable.scrollTo({ left: 0, top: this.oldRouteState.topOffset, behavior: 'auto' })
                }
            })
    }

    ngOnInit() {
        this.organizationService.get().subscribe(org => {
            this.organization = org
        })

    }

    setLanguage(language: string) {
        this.i18nService.language = language
    }

    get languages(): string[] {
        return this.i18nService.supportedLanguages
    }

    get isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm')
    }

}
