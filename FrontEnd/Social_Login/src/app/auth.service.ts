import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseURL = `http://localhost:3000`;
  token: any = `Hamada__` + localStorage.getItem('token');

  constructor(private _HttpClient: HttpClient, private _Router: Router) {
    this.token = `Hamada__` + localStorage.getItem('token');
  }

  loginWithGmail(data: any): Observable<any> {
    return this._HttpClient.post(
      `${this.baseURL}/api/user/auth/auth-gmail`,
      data
    );
  }

  registerWithGmail(data: any): Observable<any> {
    return this._HttpClient.post(
      `${this.baseURL}/api/user/auth/auth-gmail`,
      data
    );
  }

  /**
   * Call backend to invalidate session / token on server.
   * Sends the access token in the Authorization header as Bearer <token>.
   */
  logout(accessToken: string, refreshToken: string): Observable<any> {
    const headers = new HttpHeaders({
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    });
    return this._HttpClient.post(
      `${this.baseURL}/api/user/auth/logout`,
      {},
      { headers }
    );
  }
}
