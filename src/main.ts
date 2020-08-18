import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from '@app/app.module'
import { environment } from '@env/environment'

import { persistState } from '@datorama/akita'
// import { akitaConfig } from '@datorama/akita'

// akitaConfig({ resettable: true })

const state = persistState({ include: ['auth'] })

const providers = [{ provide: 'persistStorage', useValue: state }]

if (environment.production) {
    enableProdMode()
}

platformBrowserDynamic(providers)
    .bootstrapModule(AppModule)
    .catch((err) => err)
