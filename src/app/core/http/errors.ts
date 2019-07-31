import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export const handleError = (error: HttpErrorResponse) => {
	// (e) => of([{ error: e }])
	console.log('throwing Error, ', error);
	return throwError(error);
};
