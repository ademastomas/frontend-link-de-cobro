import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { VerifyPaymentLinkService } from './verify-payment-link.service';

@Injectable()
export class CanActivateApp implements CanActivate {
  constructor(private verifyPaymentLink: VerifyPaymentLinkService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.verifyPaymentLink.canActivate(route, state);
  }
}
