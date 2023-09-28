import { Component, EventEmitter, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Session } from '../models';
import { AmChartService } from './am-chart.service';
import { ChartUtilsService } from './chart-utils.service';

export interface ChartDataModel {
  date: number;
  bpm: number;
  vo2: number;
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  @Output() rangeChange = new EventEmitter<any>();
  @Output() onEditSession = new EventEmitter<string>();
  @Output() onNewSession = new EventEmitter<Session>();

  constructor(
    private chartUtils: ChartUtilsService,
    private chartService: AmChartService
  ) {
    this.chartService.newSession
      .pipe(takeUntilDestroyed())
      .subscribe((session) => this.onNewSession.emit(session as Session));

    this.chartService.editSession
      .pipe(takeUntilDestroyed())
      .subscribe((sessionId) => this.onEditSession.emit(sessionId));
  }

  ngAfterViewInit() {
    // Chart code goes in here
    this.chartUtils.browserOnly(() => {
      this.chartService.initChart('chartdiv');
      console.log('chart initialized');
    });
  }

  ngOnDestroy() {
    // Clean up root element when the component is removed
    this.chartUtils.browserOnly(() => {
      this.chartService.dispose();
    });
  }
}
