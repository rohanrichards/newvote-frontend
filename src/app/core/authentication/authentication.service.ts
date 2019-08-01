import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { includes as _includes } from 'lodash';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';

import { OrganizationService } from '@app/core/http/organization/organization.service';
import { Organization } from '@app/core/models/organization.model';

export interface Credentials {
	// Customize received credentials here
	user?: any;
	token: string;
}

export interface LoginContext {
	username: string;
	password: string;
	remember?: boolean;
	organizations?: [Organization];
}

export interface ForgotContext {
	email: string;
	recaptchaResponse: string;
}

export interface ResetContext {
	email: string;
	token: string;
	newPassword: string;
	verifyPassword: string;
}

const routes = {
	signin: () => `/auth/signin`,
	signup: (id?: string) => {
		return `/auth/signup${id ? `/${id}` : ''}`;
	},
	forgot: () => `/auth/forgot`,
	reset: () => `/auth/reset`,
	randomGet: () => `/topics`,
	sms: () => `/users/sms`,
	verify: () => `/users/verify`,
	sso: () => '/auth/jwt'
};

const credentialsKey = 'credentials';

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable()
export class AuthenticationService {

	private _credentials: Credentials | null;
	private _org: Organization;

	constructor(
		private httpClient: HttpClient,
		private jwt: JwtHelperService,
		private organizationService: OrganizationService,
		private cookieService: CookieService
	) {
		const savedCredentials = sessionStorage.getItem(credentialsKey) ||
			localStorage.getItem(credentialsKey) ||
			cookieService.get(credentialsKey);
		if (savedCredentials) {
			const creds: Credentials = <Credentials>JSON.parse(savedCredentials);
			this.setCredentials(creds, true);
			if (this.isTokenExpired()) {
				this.logout();
			}
		}

		this.organizationService.get().subscribe(org => this._org = org);
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
	signup(context: LoginContext, verificationCode?: string): Observable<Credentials> {
		context.organizations = [this.organizationService.org];
		return this.httpClient
			.post<Credentials>(routes.signup(verificationCode), context)
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
	 * Sends an email to the provided address with password reset instructions.
	 * @return True if the e-mail was sent successfully.
	 */
	forgot(context: ResetContext): Observable<Boolean> {
		// Customize credentials invalidation here
		return this.httpClient
			.post<Boolean>(routes.forgot(), context);
	}

	/**
	 * Resets the users password combined with a provided token.
	 * @return True if the password was reset successfully.
	 */
	reset(context: ResetContext): Observable<Boolean> {
		// Customize credentials invalidation here
		return this.httpClient
			.post<Boolean>(routes.reset(), context);
	}

	sso(): Observable<Boolean> {
		return this.httpClient.get<Boolean>(routes.sso());
	}

	/**
	 * Checks is the user is authenticated.
	 * @return True if the user is authenticated.
	 */
	isAuthenticated(): boolean {
		return !!this._credentials && !this.isTokenExpired();
	}

	isTokenExpired(): boolean {
		const token = this._credentials.token;
		if (!token) {
			return true;
		}
		if (this.jwt.isTokenExpired(token)) {
			this.logout();
			return true;
		}
		return false;
	}

	/**
	 * Checks is the user is an admin.
	 * @return True if the user is an admin.
	 */
	isAdmin(): boolean {
		if (this._credentials) {
			return _includes(this._credentials.user.roles, 'admin');
		} else {
			return false;
		}
	}

	/**
	 * owner implies admin or organization owner
	 * @return True if the user is an admin.
	 */
	isOwner(): boolean {
		if (this._credentials) {
			// admin owns everything
			if (_includes(this._credentials.user.roles, 'admin')) {
				return true;
			}

			// org leaders own any content within their org
			if (this._org && this._org.owner && this._org.owner === this._credentials.user._id) {
				return true;
			}

			return false;
		} else {
			return false;
		}
	}

	/**
	 * moderators are on the list of org moderators
	 * also allows through admins or owners
	 * @return True if the user is moderator.
	 */
	isModerator(): boolean {
		// debugger;
		if (this._credentials) {
			// owners and admins are allowed to do anything a moderator can
			if (this.isOwner()) {
				return true;
			}

			// check if user is within moderators list
			if (this._org && this._org.moderators && _includes(this._org.moderators, this._credentials.user._id)) {
				return true;
			}

			return false;
		} else {
			return false;
		}
	}

	/**
	 * check if content is owned by current user
	 * @return True if the user is an admin.
	 */
	isCreator(object?: any): boolean {
		if (!object) {
			return false;
		}

		if (this._credentials) {
			if (object.user) {
				const id = object.user._id || object.user;

				if (id === this._credentials.user._id) {
					return true;
				}
			}
		} else {
			return false;
		}
	}

	hasRole(role: string): boolean {
		if (this._credentials) {
			return _includes(this._credentials.user.roles, role);
		}
	}

	/**
	 * check if current user has completed verification
	 * @return True if the user is verified.
	 */
	isVerified(): boolean {
		// debugger;
		if (this._credentials) {
			return (this._credentials.user.verified === true);
		}
	}

	tourComplete(): boolean {
		if (this._credentials) {
			return this._credentials.user.completedTour;
		}
	}

	saveTourToLocalStorage() {
		this.setCredentials(this._credentials, true);
	}

	setVerified(credentials: Credentials) {
		// debugger;
		if (localStorage.getItem(credentialsKey)) {
			localStorage.setItem(credentialsKey, JSON.stringify(credentials));
		} else if (sessionStorage.getItem(credentialsKey)) {
			sessionStorage.setItem(credentialsKey, JSON.stringify(credentials));
		}
		this._credentials = credentials;
	}

	sendVerificationCode(number: number): Observable<any> {
		return this.httpClient
			.post(routes.sms(), number)
			.pipe(
				map((res) => {
					return res;
				})
			);
	}

	verifyMobile(code: number): Observable<any> {
		return this.httpClient
			.post(routes.verify(), code)
			.pipe(
				map((res) => {
					return res;
				})
			);
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
			this.cookieService.delete(credentialsKey, '/', '.newvote.org');
		}
	}

}
