import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

interface Route {
	route: string;
	id: number;
	topOffset: number;
}

@Injectable({
    providedIn: 'root'
})
export class ScrollService {
	currentRoute$ = new BehaviorSubject<any>({});

	private savedRoutes = {
	    routeHistory: <any>[]
	}

	constructor() {
	}

	get currentRoute() {
	    const lastRoute = this.savedRoutes.routeHistory.length
	    return this.currentRoute$.next(this.savedRoutes.routeHistory[lastRoute - 1])
	}

	saveRoute(route: any) {
	    if (this.savedRoutes.routeHistory.find((e: any) => e.id === route.id)) {
	        return false
	    }
	    this.savedRoutes.routeHistory.push(route)
	}

	getSavedRoutes() {
	    return this.savedRoutes.routeHistory
	}

	updateCurrentRoutePosition(position: number) {
	    const lastRoute = this.savedRoutes.routeHistory.length
	    this.savedRoutes.routeHistory[lastRoute - 1].topOffset = position
	}
}
