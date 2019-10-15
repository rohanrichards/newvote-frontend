import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { AuthenticationService } from './authentication.service'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'

@Injectable()
export class SuggestionCreatorGuard implements CanActivate {

    constructor(
        private authenticationService: AuthenticationService,
        private suggestionService: SuggestionService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): (Promise<boolean>) {
        const id = route.params.id
        if (this.authenticationService.isModerator()) {
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

                if (this.authenticationService.isAdmin() || this.authenticationService.isCreator(s)) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }

}
