import { NgModule } from '@angular/core';
import { CanActivateApp } from 'src/app/auth/can-activate-app.guard';
import { HttpClientModule } from '@angular/common/http';
import { VerifyPaymentLinkService } from 'src/app/auth/verify-payment-link.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [CanActivateApp, VerifyPaymentLinkService],
})
export class AuthModule {}
