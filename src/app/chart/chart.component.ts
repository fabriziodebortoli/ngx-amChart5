
import { Component } from '@angular/core';
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
  constructor(
    private chartUtils: ChartUtilsService,
    private chartService: AmChartService
  ) {}

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
