/*
 * Entry point of the application.
 * Only platform bootstrapping code should be here.
 * For app-specific initialization, use `app/app.component.ts`.
 */

import 'hammerjs'
import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from '@app/app.module'
import { environment } from '@env/environment'

if (environment.production) {
    enableProdMode()
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .then(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('my-worker.js')
        }
    })
    .catch(err => err)
