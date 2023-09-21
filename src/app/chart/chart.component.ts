import * as am5 from '@amcharts/amcharts5';
import { HttpClient } from '@angular/common/http';

import * as am5xy from '@amcharts/amcharts5/xy';
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
  resizeButton1!: am5.Button;
  resizeButton2!: am5.Button;

  constructor(
    private chartUtils: ChartUtilsService,
    private chartService: AmChartService,
    private http: HttpClient
  ) {}

  ngAfterViewInit() {
    // Chart code goes in here
    this.chartUtils.browserOnly(() => {
      this.chartService.initChart('chartdiv');
      console.log('chart initialized');



      // this.addSessions();

      // this.initResizeButtons();
    });
  }

  manageResizeButtonFrom() {
    // this.resizeButton1 = am5.Button.new(this.root, {
    //   themeTags: ['resize', 'horizontal'],
    //   icon: am5.Graphics.new(this.root, {
    //     themeTags: ['icon'],
    //   }),
    // });

    // // restrict from being dragged vertically
    // this.resizeButton1.adapters.add('y', function () {
    //   return 0;
    // });

    // // restrict from being dragged outside of plot
    // this.resizeButton1.adapters.add('x', (x) => {
    //   if (!x) return 0;
    //   return Math.max(0, Math.min(this.chart.plotContainer.width(), +x));
    // });

    // // change range when x changes
    // this.resizeButton1.events.on('dragged', () => {
    //   this.range1.set(
    //     'value',
    //     this.chartService.getButtonXPosition(this.resizeButton1)
    //   );
    // });

    // // get the value when drag stops
    // this.resizeButton1.events.on('dragstop', () => {
    //   console.log(
    //     'DRAGSTOP FROM',
    //     this.chartService.getButtonDateFrom(this.resizeButton1)
    //   );
    // });
  }

  manageResizeButtonTo() {
    // this.resizeButton2 = am5.Button.new(this.root, {
    //   themeTags: ['resize', 'horizontal'],
    //   icon: am5.Graphics.new(this.root, {
    //     themeTags: ['icon'],
    //   }),
    // });

    // // restrict from being dragged vertically
    // this.resizeButton2.adapters.add('y', function () {
    //   return 0;
    // });

    // // restrict from being dragged outside of plot
    // this.resizeButton2.adapters.add('x', (x) => {
    //   if (!x) return 0;
    //   return Math.max(0, Math.min(this.chart.plotContainer.width(), +x));
    // });

    // // change range when x changes
    // this.resizeButton2.events.on('dragged', () => {
    //   var value = this.chartService.getButtonXPosition(this.resizeButton2);
    //   this.range2.set('value', value);
    //   this.range1.set('endValue', value);
    // });

    // // get the value when drag stops
    // this.resizeButton2.events.on('dragstop', () => {
    //   console.log(
    //     'DRAGSTOP TO',
    //     this.chartService.getButtonDateTo(this.resizeButton2)
    //   );
    // });
  }

  initResizeButtons() {
    this.manageResizeButtonFrom();
    this.manageResizeButtonTo();
    this.showHandlers();
  }

  showHandlers() {
    // // set bullet for the range
    // this.range1.set(
    //   'bullet',
    //   am5xy.AxisBullet.new(this.root, {
    //     location: 0,
    //     sprite: this.resizeButton1,
    //   })
    // );

    // // set bullet for the range
    // this.range2.set(
    //   'bullet',
    //   am5xy.AxisBullet.new(this.root, {
    //     sprite: this.resizeButton2,
    //   })
    // );
  }



  // range1!: am5.DataItem<am5xy.IDateAxisDataItem>;
  range2!: am5.DataItem<am5xy.IDateAxisDataItem>;
  primaryButtonColor!: am5.Color;
  addSessions() {
    // var rangeDate = new Date();
    // console.log('rangeDate', rangeDate);
    // am5.time.add(
    //   rangeDate,
    //   'day',
    //   Math.round(this.series.dataItems.length / 2)
    // );
    // var rangeFrom1 = rangeDate.getTime() - am5.time.getDuration('day') * 20;
    // var rangeTo1 = rangeDate.getTime() + am5.time.getDuration('day') * 20;
    // this.addSession(rangeFrom1, rangeTo1);
    // am5.time.add(
    //   rangeDate,
    //   'day',
    //   Math.round(this.series.dataItems.length / 4)
    // );
    // var rangeFrom2 = rangeDate.getTime() - am5.time.getDuration('day') * 20;
    // var rangeTo2 = rangeDate.getTime() + am5.time.getDuration('day') * 20;
    // this.addSession(rangeFrom2, rangeTo2);
  }





  ngOnDestroy() {
    // Clean up root element when the component is removed
    this.chartUtils.browserOnly(() => {
      this.chartService.dispose();
    });
  }
}
