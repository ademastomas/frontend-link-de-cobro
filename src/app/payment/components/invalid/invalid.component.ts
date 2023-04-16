import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { map } from 'rxjs';

@Component({
  templateUrl: './invalid.component.html',
  styleUrls: ['./invalid.component.scss'],
})
export class InvalidComponent implements OnInit {
  viewportSize$: any;
  status: string = '';

  constructor(
    public breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(
      (params: Params) => (this.status = params['status'])
    );

    this.viewportSize$ = this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .pipe(map(({ matches }) => (matches ? 'XSmall' : 'notXSmall')));
  }

  getStatusImgSrc() {
    let imgSrc;

    switch (this.status) {
      case 'expired':
        imgSrc = '/frontend-link-de-cobro/assets/expired.png';
        break;
      case 'already-payed':
        imgSrc = '/frontend-link-de-cobro/assets/already-payed.png';
        break;
      default:
        imgSrc = '/frontend-link-de-cobro/assets/404.png';
    }

    return imgSrc;
  }

  getStatusTitle() {
    let title;

    switch (this.status) {
      case 'expired':
        title = 'Link caducado';
        break;
      case 'already-payed':
        title = 'Link inválido';
        break;
      default:
        title = 'Error 404';
    }

    return title;
  }

  getStatusMsg() {
    let msg;

    switch (this.status) {
      case 'expired':
        msg = 'Solicita al comercio que te comparta nuevamente un enlace';
        break;
      case 'already-payed':
        msg =
          'El link que intentas utilizar ya fue verificado, comunícate con el comercio para confirmar el estatus del pago';
        break;
      default:
        msg = 'Página no encontrada, verifica e intenta nuevamente';
    }

    return msg;
  }
}
