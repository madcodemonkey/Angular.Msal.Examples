import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectService {
  private lastRouteWithQueryStringStorageKey = 'authRedirect.lastRouteWithQueryString';
  private lastRouteWithoutQueryStringStorageKey = 'authRedirect.lastRouteWithoutQueryString';
  private ignoredRoutes: string[] = [];

  constructor(private router: Router) {
  }

  /**
   * Adds an ignored route.  Only use partial URLs and NO query strings  /login, /people/address
   */
  public addIgnoreRoutes(ignoreRoutes: string[]) {
    if (ignoreRoutes && ignoreRoutes.length > 0) {
      ignoreRoutes.forEach((item: string) => {
        if (item && item.length > 0) {
          this.ignoredRoutes.push(item.toLowerCase());
        }
      });
    }
  }

  /**
   * Clears a saved route local storage
   */
  public clearIgnoreddRoute() {
    this.ignoredRoutes.length = 0;
  }

  /**
   * Clears a saved route local storage
   */
  public clearSavedRoute() {
    localStorage.removeItem(this.lastRouteWithQueryStringStorageKey);
    localStorage.removeItem(this.lastRouteWithoutQueryStringStorageKey);
  }

  /**
   * Gets the current parital path with or without query string
   * Note: We are NOT using this.router.url because route guards stop you from getting the proper url!
   */
  public getPartialPath(includeQueryString: boolean) {
    if (includeQueryString) {
      return window.location.pathname + window.location.search;
    } else {
      return window.location.pathname;
    }
  }

  /**
   * Gets the saved route from local storage or returns '/' if it is not round.
   */
  public getSavedRoute(includeQueryString: boolean): string {
    const storageKey = includeQueryString ? this.lastRouteWithQueryStringStorageKey : this.lastRouteWithoutQueryStringStorageKey;
    if (localStorage.hasOwnProperty(storageKey)) {
      const lastRoute: string = localStorage.getItem(storageKey);
      if (lastRoute && lastRoute.length > 1) {
        return lastRoute;
      }
    }

    return '/';
  }

  /**
   * Indicates if a route is currently being ignored.
   */
  public isIgnoredRoute(route: string): boolean {
    if (route && route.length > 0) {
      let foundValue;
      const lowerRoute = route.toLowerCase();
      foundValue = this.ignoredRoutes.find((item: string) => {
        return item === lowerRoute;
      });

      return foundValue !== undefined;
    }

    return true;
  }

  /**
   * Navigates to the route saved by the saveCurrentRoute function.
   */
  public navigateToSavedRoute(reloadAllowed: boolean) {
    const lastRouteWithQueryString: string = this.getSavedRoute(true);
    if (reloadAllowed) {
      const lastRouteWithoutQueryString: string = this.getSavedRoute(false);
      const currentRouteWihtoutQueryString = this.getPartialPath(false);
      if (lastRouteWithoutQueryString === currentRouteWihtoutQueryString) {
        window.location.reload();
      }
    }

    if (lastRouteWithQueryString !== '/') {
      this.router.navigateByUrl(lastRouteWithQueryString);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Saves the current route and query paramters IF the route is NOT in the ignored routes list
   */
  public saveCurrentRoute() {
    const lastRoute = this.getPartialPath(true);

    // Ignore routes don't have query parameters so just send in base route.
    if (this.isIgnoredRoute(this.getPartialPath(false))) {
      this.clearSavedRoute();
    } else {
      localStorage.setItem(this.lastRouteWithQueryStringStorageKey, lastRoute);
      localStorage.setItem(this.lastRouteWithoutQueryStringStorageKey, this.getPartialPath(false));
    }
  }
}
