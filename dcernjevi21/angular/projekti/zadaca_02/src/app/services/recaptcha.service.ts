import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environments';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  constructor(
    private httpClient: HttpClient,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {}

  startValidation(action: string) {
    return this.recaptchaV3Service
      .execute(action)
      .pipe(switchMap((token) => this.validateToken(token)));
  }

  validateToken(token: string) {
    return this.httpClient.post<boolean>(
      `${environment.rest.host}:${environment.rest.port}/servis/app/checkRecaptcha`,
      { token }
    );
  }
}
