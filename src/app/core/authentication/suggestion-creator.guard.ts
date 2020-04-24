import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { AuthenticationService } from './authentication.service'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { AuthenticationQuery } from './authentication.query'

@Injectable()
export class SuggestionCreatorGuard implements CanActivate {

    constructor(
        private authenticationService: AuthenticationService,
        private suggestionService: SuggestionService,
        private auth: AuthenticationQuery
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): (Promise<boolean>) {
        const organizationUrl = route.params.id
        const id = route.params.suggestionId
        if (this.auth.isModerator()) {
            return Promise.resolve(true)
        }
        return new Promise((resolve, reject) => {
            if (!id) {
                resolve(false)
            }

            this.suggestionService.view({ id, orgs: [organizationUrl] }).subscribe(s => {
                if (!s) {
                    resolve(false)
                }

                if (this.auth.isAdmin() || this.auth.isCreator(s)) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }

}
