import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  Observable,
  of,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentDescriptionI } from '../payment/components/main/main.component';
import { banks } from '../../app/shared/banks';

@Injectable()
export class VerifyPaymentLinkService {
  private paymentDescription$ = new BehaviorSubject<any>({});
  paymentDescriptionObs$ = this.paymentDescription$.asObservable();

  private paymentAuth$ = new BehaviorSubject<any>({});
  paymentAuthObs$ = this.paymentAuth$.asObservable();

  banks = banks;

  constructor(private http: HttpClient, private router: Router) {}

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const headers = this.prepareHeaders(route.params);

      const payload = this.preparePaymentLinkToVerify(route.params);

      const paymentLinkVerified$ = this.http
        .post<any>(
          `${environment.ekiipagoBaseUrl}${environment.ekiipagoVerifyResource}`,
          payload,
          { headers: new HttpHeaders(headers) }
        )
        .pipe(catchError(this.handleError('verifyPaymentLink', 'operation')));

      const paymentLinkVerified = await firstValueFrom(paymentLinkVerified$);

      console.log(paymentLinkVerified);

      if (paymentLinkVerified.errorCode === '128') {
        const status = 'expired';

        await this.router.navigate(['payment/invalid', status]);
        return false;
      }

      if (paymentLinkVerified.errorCode === '127') {
        const status = 'already-payed';

        await this.router.navigate(['payment/invalid', status]);
        return false;
      }

      if (paymentLinkVerified.errorCode !== '00') {
        const status = 'not-found';

        await this.router.navigate(['payment/invalid', status]);
        return false;
      }

      const paymentDescription: PaymentDescriptionI[] =
        this.preparePaymentDescription(paymentLinkVerified, route.params);

      this.paymentDescription$.next(paymentDescription);

      this.paymentAuth$.next({
        key: route.params['key'],
        pass: paymentLinkVerified.paymentPass,
      });

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // TODO create type
  private preparePaymentLinkToVerify(params: any): any {
    const paymentLinkToVerify = {
      key: params.key,
      currency: params.currency,
      amount: params.amount,
      reference: params.reference,
      description: params.description,
    };

    return paymentLinkToVerify;
  }

  private prepareHeaders(params: any): any {
    const headers = {
      'x-client-key': params.key, // TODO
    };

    return headers;
  }

  private preparePaymentDescription(
    paymentLinkVerified: any,
    params: any
  ): PaymentDescriptionI[] {
    const paymentDescription: PaymentDescriptionI[] = [
      {
        tag: 'Teléfono',
        value: this.formatPhone(paymentLinkVerified.commercePhone),
      },
      {
        tag: 'RIF',
        value: this.formatRif(paymentLinkVerified.commerceIdNumber),
      },
      {
        tag: 'Banco Destino',
        value: this.getBankName(paymentLinkVerified.commerceBank),
      },
      { tag: 'Comercio', value: paymentLinkVerified.commerceName },
      {
        tag: 'Monto',
        value:
          paymentLinkVerified.amountConverted && paymentLinkVerified.rate
            ? `Bs. ${paymentLinkVerified.amountConverted.replace('.', ',')}`
            : `Bs. ${paymentLinkVerified.amount.replace('.', ',')}`,
      },
    ];

    if (paymentLinkVerified.externalReference) {
      paymentDescription.push({
        tag: 'Número de factura',
        value: paymentLinkVerified.externalReference,
      });
    }

    if (paymentLinkVerified.description) {
      paymentDescription.push({
        tag: 'Descripción',
        value: decodeURI(params.description),
      });
    }

    return paymentDescription;
  }

  // TODO shared
  private handleError<T>(
    serviceName = '',
    operation = 'operation',
    result = {} as T
  ) {
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

  // TODO Move to another class
  private formatPhone(phone: string): string {
    const operator = phone.substring(0, 4);
    const number = phone.substring(4);

    const phoneFormatted = `${operator}-${number}`;

    return phoneFormatted;
  }

  // TODO Move to another class
  private formatRif(rif: string): string {
    const type = rif.substring(0, 1);
    const number = rif.substring(1);

    const rifFormatted = `${type}-${number}`;

    return rifFormatted;
  }

  private getBankName(code: string): string | undefined {
    const bank = banks.find((bank) => bank.code === code);

    return bank?.name;
  }
}
