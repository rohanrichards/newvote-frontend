
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
