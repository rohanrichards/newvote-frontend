import { Injectable } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, observeOn, scan, debounceTime, tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

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
	// currentRoute$ = this._currentRoute.asObservable();

	private savedRoutes = {
		routeHistory: <any>[]
	}

	constructor(private router: Router) {
	}

	get currentRoute() {
		const lastRoute = this.savedRoutes.routeHistory.length;
		return this.currentRoute$.next(this.savedRoutes.routeHistory[lastRoute - 1]);
	}

	set currentRoute(route: any) {
		this.savedRoutes.routeHistory.push(route);
	}

	getSavedRoutes() {
		return this.savedRoutes.routeHistory;
	}

	updateCurrentRoutePosition(position: number) {
		const lastRoute = this.savedRoutes.routeHistory.length;
		const theRoute = this.savedRoutes.routeHistory[lastRoute - 1];
		theRoute.topOffset = position;
		console.log(this.savedRoutes, 'this is savedRoutes');
		console.log(theRoute, 'this is theRoute');
	}
}
