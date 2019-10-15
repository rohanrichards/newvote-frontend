import { LandingComponent } from './landing.component'
import { Routes, Route } from '@angular/router'

export class Landing {
    /**
	 * Creates routes using the shell component and authentication.
	 * @param routes The routes to add.
	 * @return The new route using shell as the base.
	 */
    static childRoutes(routes: Routes): Route {
        return {
            path: '',
            component: LandingComponent,
            children: routes,
            // data: { reuse: true }
        }
    }
}
