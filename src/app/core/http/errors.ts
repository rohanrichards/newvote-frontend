import { HttpErrorResponse } from '@angular/common/http'
import { throwError } from 'rxjs'

export const handleError = (error: HttpErrorResponse) => {
    // (e) => of([{ error: e }])
    return throwError(error)
}
