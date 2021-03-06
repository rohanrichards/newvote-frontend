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
        private authenticationQuery: AuthenticationQuery
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): (Promise<boolean>) {
        const id = route.params.id
        if (this.authenticationQuery.isModerator()) {
            return Promise.resolve(true)
        }
        return new Promise((resolve, reject) => {
            if (!id) {
                resolve(false)
            }

            this.suggestionService.view({ id }).subscribe(s => {
                if (!s) {
                    resolve(false)
                }

                if (this.authenticationQuery.isAdmin() || this.authenticationQuery.isCreator(s)) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }

}
