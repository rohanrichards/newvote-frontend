import { Injectable } from '@angular/core'
import { ProgressStore } from './progress.store'
import { HttpClient } from '@angular/common/http'
import { tap } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class ProgressService {

    constructor(private progressStore: ProgressStore,
        private http: HttpClient) {
    }

    get() {
        return this.http.get('').pipe(tap(entities => this.progressStore.set(entities)))
    }
}
