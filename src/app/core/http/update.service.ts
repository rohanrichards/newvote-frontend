import { Injectable, ApplicationRef } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { MatSnackBar } from '@angular/material/snack-bar'
import { first, mergeMap, concatAll, tap, switchMap } from 'rxjs/operators'
import { interval, concat, of, scheduled, combineLatest } from 'rxjs'

@Injectable()
export class UpdateService {
    // https://medium.com/@arjenbrandenburgh/angulars-pwa-swpush-and-swupdate-15a7e5c154ac
    constructor(
        private appRef: ApplicationRef,
        private swUpdate: SwUpdate,
        private snackbar: MatSnackBar,
    ) {
        // App checks CDN for updated versions of the app
        // If found a notification is sent to the user
        if (this.swUpdate.isEnabled) {
            swUpdate.checkForUpdate()
            interval(60 * 60 * 1000).subscribe(() => {
                return swUpdate.checkForUpdate()
            })
        }
        
        // // Allow the app to stabilize first, before starting polling for updates with `interval()`.
        // const appIsStable$ = appRef.isStable.pipe(
        //     first(isStable => isStable),
        //     tap(stable => console.log(stable, 'App is stable')),
        //     switchMap(() => interval(60 * 1000))
        // )

        // // const everySixHours$ = interval(6 * 60 * 60 * 1000)
        // appIsStable$.subscribe((counter) => {
        //     console.log(counter, 'this is counter')
        //     console.log('app is stable and checking update')
        //     this.swUpdate.checkForUpdate()
        // })
    }

    checkForUpdates() {
        this.swUpdate.available.subscribe(event => {
            this.handleAppUpdate()
        })
    }

    handleAppUpdate() {
        const snack = this.snackbar.open(
            'A new version of NewVote is available.',
            'Refresh',
            {
                duration: 0,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            },
        )

        snack.onAction().subscribe(() => {
            this.updateToLatest()
        })
    }

    updateToLatest() {
        console.log('Updating to latest version.')
        this.swUpdate.activateUpdate().then(() => document.location.reload())
    }
}
