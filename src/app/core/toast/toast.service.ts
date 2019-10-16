import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

type ToastConfig = {
    duration: number,
    horizontalPosition: string,
    veriticalPosition: string
}

const defaultConfig = {
    duration: 4000,
    horizontalPosition: 'right',
    veriticalPosition: 'bottom'
} as MatSnackBarConfig;


@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor(private snackBar: MatSnackBar,
    ) { }

    openSnackBar(message: string, action: string, config: MatSnackBarConfig = defaultConfig) {
        this.snackBar.open(message, action, config);
    }

}
