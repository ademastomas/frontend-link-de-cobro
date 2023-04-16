import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class PaymentService {
  private verifyUrl = `${environment.ekiipagoBaseUrl}${environment.ekiipagoVerifyResource}`;
  private paymentUrl = `${environment.ekiipagoBaseUrl}${environment.ekiipagoPaymentValidateResource}`;

  constructor(private http: HttpClient) {}

  verifyPaymentLink(payload: any) {
    return this.http
      .post<any>(this.verifyUrl, payload, {})
      .pipe(catchError(this.handleError('verifyPaymentLink', payload)));
  }

  notifyPayment(headers: any, payload: any): Observable<any> {
    return this.http
      .post<any>(this.paymentUrl, payload, {
        headers: new HttpHeaders(headers),
      })
      .pipe(catchError(this.handleError('notifyPayment', payload)));
  }

  /* Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   *
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(serviceName = '', operation = 'operation', result = {} as T) {
    return (error: HttpErrorResponse): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      const message =
        error.error instanceof ErrorEvent
          ? error.error.message
          : `server returned code ${error.status} with body "${error.error}"`;

      // TODO: better job of transforming error for user consumption
      //  this.messageService.add(`${serviceName}: ${operation} failed: ${message}`);

      // Let the app keep running by returning a safe result.
      return of(result);
    };
  }
}
