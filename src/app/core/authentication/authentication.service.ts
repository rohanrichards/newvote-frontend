import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { includes as _includes } from 'lodash';

export interface Credentials {
	// Customize received credentials here
	user?: any;
	token: string;
}

export interface LoginContext {
	username: string;
	password: string;
	remember?: boolean;
}

const routes = {
	signin: () => `/auth/signin`,
	signup: () => `/auth/signup`,
	randomGet: () => `/topics`
};

const credentialsKey = 'credentials';

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable()
export class AuthenticationService {

	private _credentials: Credentials | null;

	constructor(private httpClient: HttpClient) {
		const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
		if (savedCredentials) {
			this._credentials = JSON.parse(savedCredentials);
		}
	}

	randomGet() {
		return this.httpClient
			.get(routes.randomGet())
			.pipe(
				map((res) => {
					// this.setCredentials(res, context.remember);
					return res;
				})
			);
	}

	/**
	 * Authenticates the user.
	 * @param context The login parameters.
	 * @return The user credentials.
	 */
	login(context: LoginContext): Observable<Credentials> {
		return this.httpClient
			.post<Credentials>(routes.signin(), context)
			.pipe(
				map((res) => {
					this.setCredentials(res, context.remember);
					return res;
				})
			);
	}

	/**
	 * Creates a new user.
	 * @param context The signup parameters.
	 * @return The user credentials.
	 */
	signup(context: LoginContext): Observable<Credentials> {
		return this.httpClient
			.post<Credentials>(routes.signup(), context)
			.pipe(
				map((res) => {
					this.setCredentials(res, context.remember);
					return res;
				})
			);
	}

	/**
	 * Logs out the user and clear credentials.
	 * @return True if the user was logged out successfully.
	 */
	logout(): Observable<boolean> {
		// Customize credentials invalidation here
		this.setCredentials();
		return of(true);
	}

	/**
	 * Checks is the user is authenticated.
	 * @return True if the user is authenticated.
	 */
	isAuthenticated(): boolean {
		return !!this.credentials;
	}

	/**
	 * Checks is the user is an admin.
	 * @return True if the user is an admin.
	 */
	isAdmin(): boolean {
		if (this._credentials) {
			return _includes(this._credentials.user.roles, 'admin');
		}
	}

	hasRole(role: string): boolean {
		if (this._credentials) {
			return _includes(this._credentials.user.roles, role);
		}
	}

	/**
	 * Gets the user credentials.
	 * @return The user credentials or null if the user is not authenticated.
	 */
	get credentials(): Credentials | null {
		return this._credentials;
	}

	/**
	 * Sets the user credentials.
	 * The credentials may be persisted across sessions by setting the `remember` parameter to true.
	 * Otherwise, the credentials are only persisted for the current session.
	 * @param credentials The user credentials.
	 * @param remember True to remember credentials across sessions.
	 */
	private setCredentials(credentials?: Credentials, remember?: boolean) {
		this._credentials = credentials || null;

		if (credentials) {
			const storage = remember ? localStorage : sessionStorage;
			storage.setItem(credentialsKey, JSON.stringify(credentials));
		} else {
			sessionStorage.removeItem(credentialsKey);
			localStorage.removeItem(credentialsKey);
		}
	}

}
