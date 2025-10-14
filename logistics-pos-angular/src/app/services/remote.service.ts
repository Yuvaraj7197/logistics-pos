
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environmentCommon } from '../../environments/environment.common';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private hasShownToast = false;


  constructor(private http: HttpClient, private common: CommonService) {}

  sendRequest(method: string, url: string, data?: any, loader?: boolean): Observable<any> {
  if (data) this.common.setLoader(true);
  if (loader) this.common.setLoader(true);

  let headers = new HttpHeaders();
  if (!(data instanceof FormData)) {
    headers = headers.set('Content-Type', 'application/json');
  }

  const authData = localStorage.getItem('admin_auth');
  let accessToken: string | null = null;

  if (authData) {
    try {
      const authObj = JSON.parse(authData);
      accessToken = authObj.access || null;
    } catch (e) {
      accessToken = null;
    }
  }


    // const authData = localStorage.getItem('admin_auth');
    // let token: string | null = null;

    // try {
    //   token = authData;
    // } catch (e) {
    //   token = null;
    // }
  
    if (accessToken && !url.includes('/login') && !url.includes('/refresh')) {
      headers = headers.set('Authorization', `Bearer ${accessToken}`);
    }

    if (authData && !url.includes('/login') && !url.includes('/refresh') && !url.includes('/register') && !url.includes('/change/password') && !url.includes('verify/otp') && !url.includes('/forgot/password') && !url.includes('/reset/password')) {
      headers = headers.set('Authorization', `Bearer ${authData}`);
    }



    let request: Observable<any>;

    switch (method) {
      case 'GET':
        request = this.http.get(url, { headers });
        break;
      case 'POST':
        request = this.http.post(url, data, { headers });
        break;
      case 'PUT':
        request = this.http.put(url, data, { headers });
        break;
      case 'DELETE':
        request = this.http.delete(url, { headers });
        break;
      default:
        request = this.http.get(url, { headers });
        break;
    }
    this.common.setLoader(false);

    return request.pipe(
      catchError(error => {
        this.common.setLoader(false)
        return throwError(() => error);
      })
    );
  }


  private handle401Error(method: string, url: string, data?: any, loader?: boolean): Observable<any> {
    return this.refreshToken().pipe(
      switchMap((newAccessToken: string | null) => {
        if (!newAccessToken) {
          this.showToast('Session expired. Please log in again.');
          this.logoutUser();
          return throwError(() => new Error('Session expired. Please log in again.'));
        }

        let headers = new HttpHeaders()
          .set('content-type', 'application/json')
          .set('Authorization', `Bearer ${newAccessToken}`);

        let retryRequest: Observable<any>;
        switch (method) {
          case 'GET':
            retryRequest = this.http.get(url, { headers });
            break;
          case 'POST':
            retryRequest = this.http.post(url, data, { headers });
            break;
          case 'PUT':
            retryRequest = this.http.put(url, data, { headers });
            break;
          case 'DELETE':
            retryRequest = this.http.delete(url, { headers });
            break;
          default:
            retryRequest = this.http.get(url, { headers });
            break;
        }

        return retryRequest;
      }),
      catchError(error => {
        this.showToast('Session expired. Please log in again.');
        this.logoutUser();
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<string | null> {
    const authData = localStorage.getItem('admin_auth') || '{}';
    const refreshToken = JSON.parse(authData)?.refresh || null;

    if (!refreshToken) {
      this.showToast('No refresh token available. Logging out.');
      this.logoutUser();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ access: string }>(environmentCommon.api.login.REFRESH, { refresh: refreshToken }).pipe(
      map(response => {
        const newAccessToken = response.access;
        if (newAccessToken) {
          const auth = JSON.parse(authData);
          auth.access = newAccessToken;
          localStorage.setItem('admin_auth_obj', JSON.stringify(authData));
          localStorage.setItem('admin_auth', JSON.stringify(auth));
          return newAccessToken;
        }
        return null;
      }),
      catchError(error => {
        this.showToast('Session expired. Please log in again.');
        this.logoutUser();
        return throwError(() => new Error('Session expired. Please log in again.'));
      })
    );
  }

  logoutUser(): void {
    if (!this.hasShownToast) {
      this.showToast('Session expired. Please log in again.');
      this.hasShownToast = true;
    }

    localStorage.removeItem('admin_auth');

    setTimeout(() => {
      this.hasShownToast = false;
      window.location.href = '/login';
    }, 1500);
  }


  getPdf(url: string): Observable<HttpResponse<Blob>> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    const authData = localStorage.getItem('admin_auth');
    const auth = authData ? JSON.parse(authData) : null;
    const token = auth && auth.token ? `Token ${auth.token}` : '';

    headers = headers.set('Authorization', token);

    return this.http.get(url, { headers, responseType: 'blob', observe: 'response' });
  }

  private showToast(message: string) {
    // this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}



