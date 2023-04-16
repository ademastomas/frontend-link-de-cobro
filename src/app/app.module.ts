import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CanActivateApp } from './auth/can-activate-app.guard';
import { AuthModule } from './auth/auth.module';
import { MainComponent } from './payment/components/main/main.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from './payment/payment.service';
import { InvalidComponent } from './payment/components/invalid/invalid.component';

const routes: Routes = [
  {
    path: 'payment/:key/:amount/:currency/:description',
    canActivate: [CanActivateApp],
    component: MainComponent,
  },
  {
    path: 'payment/:key/:amount/:currency',
    canActivate: [CanActivateApp],
    component: MainComponent,
  },
  {
    path: 'payment/invalid/:status',
    component: InvalidComponent,
  },
  { path: '**', redirectTo: 'payment/invalid/not-found' },
];

@NgModule({
  declarations: [AppComponent, MainComponent, InvalidComponent],
  imports: [
    HttpClientModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    AuthModule,
  ],
  providers: [PaymentService],

  bootstrap: [AppComponent],
})
export class AppModule {}
