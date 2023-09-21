import * as am5 from '@amcharts/amcharts5';

import * as am5xy from '@amcharts/amcharts5/xy';
import { Component } from '@angular/core';
import { AmChartService } from './am-chart.service';
import { ChartUtilsService } from './chart-utils.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  providers: [AmChartService],
})
export class ChartComponent {
  resizeButton1!: am5.Button;
  resizeButton2!: am5.Button;

  constructor(
    private chartUtils: ChartUtilsService,
    private chartService: AmChartService
  ) {}

  ngAfterViewInit() {
    // Chart code goes in here
    this.chartUtils.browserOnly(() => {
      this.chartService.initChart('chartdiv');

      // this.addCursor();
      // this.rangeSelectionEvents();

      // this.addScrollbar();

      // this.addSessions();

      // this.initResizeButtons();

      this.addSeries();
    });
  }

  private root!: am5.Root;
  private chart!: am5xy.XYChart;

  manageResizeButtonFrom() {
    this.resizeButton1 = am5.Button.new(this.root, {
      themeTags: ['resize', 'horizontal'],
      icon: am5.Graphics.new(this.root, {
        themeTags: ['icon'],
      }),
    });

    // restrict from being dragged vertically
    this.resizeButton1.adapters.add('y', function () {
      return 0;
    });

    // restrict from being dragged outside of plot
    this.resizeButton1.adapters.add('x', (x) => {
      if (!x) return 0;
      return Math.max(0, Math.min(this.chart.plotContainer.width(), +x));
    });

    // change range when x changes
    this.resizeButton1.events.on('dragged', () => {
      this.range1.set(
        'value',
        this.chartService.getButtonXPosition(this.resizeButton1)
      );
    });

    // get the value when drag stops
    this.resizeButton1.events.on('dragstop', () => {
      console.log(
        'DRAGSTOP FROM',
        this.chartService.getButtonDateFrom(this.resizeButton1)
      );
    });
  }

  manageResizeButtonTo() {
    this.resizeButton2 = am5.Button.new(this.root, {
      themeTags: ['resize', 'horizontal'],
      icon: am5.Graphics.new(this.root, {
        themeTags: ['icon'],
      }),
    });

    // restrict from being dragged vertically
    this.resizeButton2.adapters.add('y', function () {
      return 0;
    });

    // restrict from being dragged outside of plot
    this.resizeButton2.adapters.add('x', (x) => {
      if (!x) return 0;
      return Math.max(0, Math.min(this.chart.plotContainer.width(), +x));
    });

    // change range when x changes
    this.resizeButton2.events.on('dragged', () => {
      var value = this.chartService.getButtonXPosition(this.resizeButton2);
      this.range2.set('value', value);
      this.range1.set('endValue', value);
    });

    // get the value when drag stops
    this.resizeButton2.events.on('dragstop', () => {
      console.log(
        'DRAGSTOP TO',
        this.chartService.getButtonDateTo(this.resizeButton2)
      );
    });
  }

  initResizeButtons() {
    this.manageResizeButtonFrom();
    this.manageResizeButtonTo();
    this.showHandlers();
  }

  showHandlers() {
    // set bullet for the range
    this.range1.set(
      'bullet',
      am5xy.AxisBullet.new(this.root, {
        location: 0,
        sprite: this.resizeButton1,
      })
    );

    // set bullet for the range
    this.range2.set(
      'bullet',
      am5xy.AxisBullet.new(this.root, {
        sprite: this.resizeButton2,
      })
    );
  }

  sessionColor = am5.color(0x00ff00);
  addSession(rangeFrom: number, rangeTo: number) {
    // console.log('rangeFrom', new Date(rangeFrom));
    // console.log('rangeTo', new Date(rangeTo));
    // // add axis range 1
    // this.range1 = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));
    // this.range1.set('value', rangeFrom);
    // this.range1.set('endValue', rangeTo);
    // this.range1.get('grid')?.setAll({
    //   strokeOpacity: 1,
    //   stroke: this.sessionColor,
    // });
    // // add axis range 2
    // this.range2 = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));
    // this.range2.set('value', rangeTo);
    // this.range2.get('grid')?.setAll({
    //   strokeOpacity: 1,
    //   stroke: this.sessionColor,
    // });
    // var axisFill = this.range1.get('axisFill');
    // axisFill?.setAll({
    //   fillOpacity: 0.15,
    //   fill: this.sessionColor,
    //   visible: true,
    //   draggable: true, // se true deve gesture dragstop
    // });
    // // restrict from being dragged vertically
    // axisFill?.adapters.add('y', function () {
    //   return 0;
    // });
    // axisFill?.events.on('dragstop', () => {
    //   var dx = axisFill?.x();
    //   if (!dx) return;
    //   var x = this.resizeButton1.x() + dx;
    //   var position = this.xAxis.toAxisPosition(
    //     x / this.chart.plotContainer.width()
    //   );
    //   var endPosition = this.xAxis.toAxisPosition(
    //     (x + (axisFill?.width() || 0)) / this.chart.plotContainer.width()
    //   );
    //   var value = this.xAxis.positionToValue(position);
    //   var endValue = this.xAxis.positionToValue(endPosition);
    //   console.log('selected range', new Date(value), new Date(endValue));
    //   this.range1.set('value', value);
    //   this.range1.set('endValue', endValue);
    //   this.range2.set('value', endValue);
    //   axisFill?.set('x', 0);
    // });
  }

  range1!: am5.DataItem<am5xy.IDateAxisDataItem>;
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

  rangeSelectionEvents() {
    // let selectStatedX: any;
    // this.cursor.events.on('selectstarted', () => {
    //   selectStatedX = this.cursor.getPrivate('positionX');
    // });
    // this.cursor.events.on('selectended', () => {
    //   let selectEndedX = this.cursor.getPrivate('positionX') || 0;
    //   let startValue = this.xAxis.positionToValue(
    //     this.xAxis.toAxisPosition(selectStatedX)
    //   );
    //   let endValue = this.xAxis.positionToValue(
    //     this.xAxis.toAxisPosition(selectEndedX)
    //   );
    //   // flip if start > end
    //   if (startValue > endValue) {
    //     [startValue, endValue] = [endValue, startValue];
    //   }
    //   let skip = false;
    //   // check for overlapping
    //   let len = this.xAxis.axisRanges.length;
    //   for (var i = len - 1; i >= 0; i--) {
    //     let axisRange = this.xAxis.axisRanges.getIndex(i);
    //     let axisRangeStartValue = axisRange?.get('value') || 0;
    //     let axisRangeEndValue = axisRange?.get('endValue') || 0;
    //     // flip if start > end
    //     if (axisRangeStartValue > axisRangeEndValue) {
    //       [axisRangeStartValue, axisRangeEndValue] = [
    //         axisRangeEndValue,
    //         axisRangeStartValue,
    //       ];
    //     }
    //     // if both end and start values are within old range, do not do anything
    //     if (
    //       startValue >= axisRangeStartValue &&
    //       startValue <= axisRangeEndValue &&
    //       endValue >= axisRangeStartValue &&
    //       endValue <= axisRangeEndValue
    //     ) {
    //       skip = true;
    //     } else {
    //       if (
    //         startValue >= axisRangeStartValue &&
    //         startValue <= axisRangeEndValue
    //       ) {
    //         startValue = axisRangeEndValue;
    //       }
    //       if (
    //         endValue >= axisRangeStartValue &&
    //         endValue <= axisRangeEndValue
    //       ) {
    //         endValue = axisRangeStartValue;
    //       }
    //     }
    //     // if a new range takes within itself whole old range, remove old range
    //     if (
    //       axisRange &&
    //       startValue <= axisRangeStartValue &&
    //       endValue >= axisRangeEndValue
    //     ) {
    //       this.xAxis.axisRanges.removeValue(axisRange);
    //     }
    //   }
    //   const primaryButtonColor = this.root.interfaceColors.get('primaryButton');
    //   if (!skip) {
    //     let dataItem = this.xAxis.makeDataItem({});
    //     dataItem.set('value', startValue);
    //     dataItem.set('endValue', endValue);
    //     this.xAxis.createAxisRange(dataItem);
    //     dataItem.get('axisFill')?.setAll({
    //       fill: primaryButtonColor, //am5.color(0x00ff00),//chart.get('colors')?.getIndex(8),
    //       fillOpacity: 0.4,
    //       visible: true,
    //     });
    //     dataItem.get('grid')?.set('forceHidden', true);
    //   }
    //   this.cursor.selection.hide();
    // });
  }

  // Add scrollbar
  addScrollbar() {
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    this.chart.set(
      'scrollbarX',
      am5.Scrollbar.new(this.root, {
        orientation: 'horizontal',
      })
    );
  }

  addSeries() {
    // Set data
    let data = this.chartUtils.generateDatas();
    console.log('data', data);
    this.chartService.setData(data);
  }

  ngOnDestroy() {
    // Clean up root element when the component is removed
    this.chartUtils.browserOnly(() => {
      this.chartService.dispose();
    });
  }
}
