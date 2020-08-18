import { Injectable } from '@angular/core'
import { InjectionToken } from '@angular/core'

// export const LocalStorage = new InjectionToken<any>('localStorage')

@Injectable({
    providedIn: 'root',
})
export class StorageService {

    set(name: string, object: any): void {
        localStorage.setItem(name, object)
    }

    get(name: string): any {
        return localStorage.getItem(name)
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }
}
