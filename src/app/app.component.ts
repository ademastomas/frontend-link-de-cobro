import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import {
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  Router,
} from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  loading = true;
  viewportSize$: any;

  constructor(
    private router: Router,
    public breakpointObserver: BreakpointObserver
  ) {}

  async ngOnInit(): Promise<void> {
    this.router.events.subscribe((event) => {
      if (event instanceof GuardsCheckStart) {
        this.loading = true;
      }
      if (
        event instanceof GuardsCheckEnd ||
        event instanceof NavigationCancel
      ) {
        this.loading = false;
      }
    });

    this.viewportSize$ = this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .pipe(map(({ matches }) => (matches ? 'XSmall' : 'notXSmall')));
  }
}
