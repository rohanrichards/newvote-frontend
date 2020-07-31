import { Component, OnInit, NgZone } from '@angular/core'
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { merge, asyncScheduler } from 'rxjs'
import { filter, map, mergeMap, observeOn } from 'rxjs/operators'
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'

import { environment } from '../environments/environment'
import { Logger, I18nService, OrganizationService } from '@app/core'
import { Organization } from '@app/core/models/organization.model'
import { MetaService } from '@app/core/meta.service'
import { DataFetchService } from '@app/core/http/data/data-fetch.service'
import { UpdateService } from '@app/core/http/update.service'
import { TranslateService } from '@ngx-translate/core'

const log = new Logger('App')

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title,
        private zone: NgZone,
        private translateService: TranslateService,
        // do not remove the analytics injection, even if the call in ngOnInit() is removed
        // this injection initializes page tracking through the router
        private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
        private i18nService: I18nService,
        private organizationService: OrganizationService,
        private meta: MetaService,
        private dataFetch: DataFetchService,
        private updateService: UpdateService,
    ) {}

    ngOnInit() {
        this.updateService.checkForUpdates()
        // Setup logger
        if (environment.production) {
            Logger.enableProductionMode()
        }

        log.debug('init')

        this.angulartics2GoogleAnalytics.eventTrack(environment.version, {
            category: 'App initialized',
        })

        // Setup translations
        this.i18nService.init(
            environment.defaultLanguage,
            environment.supportedLanguages,
        )

        const onNavigationEnd = this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
        )

        // Change page title on navigation or language change, based on route data
        merge(this.translateService.onLangChange, onNavigationEnd)
            .pipe(
                map(() => {
                    let route = this.activatedRoute
                    while (route.firstChild) {
                        route = route.firstChild
                    }
                    return route
                }),
                filter((route) => route.outlet === 'primary'),
                mergeMap((route) => route.data),
                observeOn(asyncScheduler),
            )
            .subscribe((event) => {
                const title = event.title
                if (title) {
                    this.titleService.setTitle(
                        this.translateService.instant(title),
                    )
                }

                const level = event.level
                if (level) {
                    this.meta.updateRouteLevel(level)
                }
            })

        this.organizationService.get().subscribe((org: Organization) => {
            if (!org) {
                // debugger;
                this.router.navigate(['/landing'])
            }
        })
    }
}
