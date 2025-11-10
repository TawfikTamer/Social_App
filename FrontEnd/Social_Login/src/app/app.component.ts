import { Component } from '@angular/core';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'socialLoginApp';
  user: any;
  loggedIn: any;
  accessToken: string | null = null;
  refreshToken: string | null = null;

  constructor(
    private authService: SocialAuthService,
    public _authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.authState.subscribe((user: any) => {
      this.user = user;
      this.loggedIn = user != null;
      // If we have an ID token from the social provider, send it to backend
      // and persist the returned access token for later logout calls.
      if (this.user?.idToken) {
        this.handelSignIn(this.user.idToken);
      }
    });
  }

  signOut() {
    // Determine access token to send to backend (prefer localStorage token)
    const localToken = localStorage.getItem('token');
    const accessToken =
      localToken ||
      this.accessToken ||
      this.user?.authToken ||
      this.user?.idToken;
    const refreshToken =
      localToken ||
      this.refreshToken ||
      this.user?.authToken ||
      this.user?.idToken;

    if (accessToken) {
      this._authService.logout(accessToken, refreshToken).subscribe(
        (res) => {
          console.log('Server logout successful', res);
        },
        (err) => {
          console.warn('Server logout failed', err);
        }
      );
    }

    // Always sign out from SocialAuthService (this clears local social session)
    this.authService
      .signOut()
      .then(() => {
        // Also disable Google auto select if available
        try {
          (window as any).google?.accounts?.id?.disableAutoSelect?.();
        } catch (e) {}
        // clear client storage tokens if you use them
        try {
          localStorage.removeItem('token');
        } catch (e) {}
        this.user = null;
        this.loggedIn = false;
        console.log('User signed out');
      })
      .catch((err) => console.error('Sign-out failed', err));
  }

  handelSignIn(idToken: any) {
    this._authService.registerWithGmail({ idToken }).subscribe((res: any) => {
      console.log(`Response from registerWithGmail`, { res });
      // Backend response structure may be: { meta: {...}, data: { message: '...', data: { accessToken: '...' } } }
      // Try several common paths to locate the access token safely.
      const token =
        res?.data?.data?.accessToken ||
        res?.data?.accessToken ||
        res?.accessToken ||
        null;

      if (token) {
        this.accessToken = token;
        try {
          localStorage.setItem('token', token);
        } catch (e) {
          console.warn('Could not persist token to localStorage', e);
        }
      }
    });
  }
}
