import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

enum AppState {
    loading = 'loading',
    loaded = 'loaded',
    serverError = 'serverError',
    error = 'error',
    complete = 'complete'
}

@Injectable({
    providedIn: 'root'
})
export class StateService {

    _loadingState = new BehaviorSubject<AppState>(AppState.loading);
    loadingState$ = this._loadingState.asObservable();

    get loadingState() {
        return this._loadingState.getValue()
    }

    set loadingState(state: string) {
        this._loadingState.next(AppState[`${state}`])
    }

    setLoadingState(state: string) {
        this.loadingState = state
    }
}
