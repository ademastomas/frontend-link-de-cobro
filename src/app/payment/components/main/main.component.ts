import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { concatMap, delay, firstValueFrom, map, of } from 'rxjs';
import { VerifyPaymentLinkService } from 'src/app/auth/verify-payment-link.service';
import { PaymentI } from '../../interfaces/payment.interface';
import { PaymentService } from '../../payment.service';
import { banks } from '../../../shared/banks';
import { operators } from '../../../shared/operators';
import { nationalities } from '../../../shared/nationalities';

export interface PaymentDescriptionI {
  tag: string;
  value: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class MainComponent implements OnInit {
  @ViewChild('stepper') private stepper!: MatStepper;

  customerFormGroup = this._formBuilder.group({
    surname: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(25),
        Validators.pattern("^[a-zA-Z'áéíóúäëïöü)]+( [a-zA-Z'áéíóúäëïöü]+)*$"),
      ],
    ],
    lastname: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(25),
        Validators.pattern("^[a-zA-Z'áéíóúäëïöü)]+( [a-zA-Z'áéíóúäëïöü]+)*$"),
      ],
    ],
    phoneCode: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{7}$')]],
    nationality: ['', [Validators.required]],
    id: ['', [Validators.required, Validators.pattern('^[0-9]{5,9}$')]],
    bank: ['', Validators.required],
    reference: ['', [Validators.required, Validators.pattern('^[0-9]{6,16}$')]],
  });

  displayedColumns: string[] = ['tag', 'value'];
  state: string = 'waiting';
  paymentDescription: any;
  paymentAuth: any;
  viewportSize$: any;
  banks = banks;
  defaultBank = banks[0];
  operators = operators;
  defaultOperator = operators[0];
  nationalities = nationalities;
  defaultNationality = nationalities[0];
  stepperState: string = '';
  stepperCompleted: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    public breakpointObserver: BreakpointObserver,
    private paymentService: PaymentService,
    private verifyPaymentLinkService: VerifyPaymentLinkService
  ) {}

  async ngOnInit(): Promise<void> {
    this.viewportSize$ = this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .pipe(map(({ matches }) => (matches ? 'XSmall' : 'notXSmall')));

    this.verifyPaymentLinkService.paymentDescriptionObs$.subscribe((value) => {
      this.paymentDescription = value;

      console.log(this.paymentDescription);
    });

    this.verifyPaymentLinkService.paymentAuthObs$.subscribe((value) => {
      this.paymentAuth = value;

      console.log(this.paymentAuth);

      this.customerFormGroup.controls['bank'].setValue(this.defaultBank.code);
      this.customerFormGroup.controls['phoneCode'].setValue(
        this.defaultOperator.code
      );
      this.customerFormGroup.controls['nationality'].setValue(
        this.defaultNationality.code
      );
    });
  }

  async validatePayment(): Promise<void> {
    try {
      this.state = 'waiting';

      console.log(this.customerFormGroup.value);

      const headers = this.prepareHeaders(this.paymentAuth);

      const paymentToValidate = this.preparePaymentToValidate(
        this.customerFormGroup.value
      );

      const paymentValidated$ = this.paymentService
        .notifyPayment(headers, paymentToValidate)
        .pipe(concatMap((item) => of(item).pipe(delay(2000))));

      const paymentValidated = await firstValueFrom(paymentValidated$);

      console.log(paymentValidated);

      this.state = paymentValidated.errorCode === '00' ? 'success' : 'fail';

      this.resetForm();

      return;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public stepperGoInitialStep() {
    this.stepper.reset();
    this.stepper.previous();
    this.stepper.previous();

    this.resetForm();
  }

  public setStepDone() {
    this.stepperCompleted = true;
    this.stepperState = 'done';
  }

  private prepareHeaders(paymentAuth: any): any {
    const headers = {
      'x-client-key': paymentAuth.key,
      'x-client-pass': paymentAuth.pass,
    };

    return headers;
  }

  private preparePaymentToValidate(customerFormValue: any): PaymentI {
    const paymentToValidate: PaymentI = {
      paymentType: 'P2C', // TODO interface
      customerName: `${customerFormValue.surname} ${customerFormValue.lastname}`,
      customerEmail: '', // TODO optional
      customerPhone: `${customerFormValue.phoneCode}${customerFormValue.phoneNumber}`,
      customerIdentification: `${customerFormValue.nationality}${customerFormValue.id}`,
      customerBank: customerFormValue.bank,
    };

    return paymentToValidate;
  }

  private resetForm() {
    this.customerFormGroup.reset();
    Object.keys(this.customerFormGroup.controls).forEach((key) => {
      this.customerFormGroup.controls[
        key as keyof typeof this.customerFormGroup.controls
      ].setErrors(null);
    });

    this.customerFormGroup.controls['bank'].setValue(this.defaultBank.code);
    this.customerFormGroup.controls['phoneCode'].setValue(
      this.defaultOperator.code
    );
    this.customerFormGroup.controls['nationality'].setValue(
      this.defaultNationality.code
    );
  }
}
