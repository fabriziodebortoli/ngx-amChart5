import * as am5 from '@amcharts/amcharts5';
import { LineSeries } from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  private root!: am5.Root;

  chart!: am5xy.XYChart;
  cursor!: am5xy.XYCursor;
  series!: LineSeries;

  resizeButton1!: am5.Button;
  resizeButton2!: am5.Button;
  xAxis!: am5xy.DateAxis<am5xy.AxisRendererX>;
  yAxis!: am5xy.DateAxis<am5xy.AxisRendererY>;

  date = new Date();
  value = 100;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private zone: NgZone
  ) {
    this.date.setHours(0, 0, 0, 0);
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngAfterViewInit() {
    // Chart code goes in here
    this.browserOnly(() => {
      this.initChart();
      this.createAxes();

      // this.addCursor();
      // this.rangeSelectionEvents();

      this.addSeries();
      this.addScrollbar();

      this.addSessions();

      this.initResizeButtons();
    });
  }

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
      this.range1.set('value', this.getXposition());
    });

    // get the value when drag stops
    this.resizeButton1.events.on('dragstop', () => {
      console.log('DRAGSTOP FROM', this.getFromDate());
    });
  }

  getXposition() {
    var x = this.resizeButton1.x();
    var position = this.xAxis.toAxisPosition(
      x / this.chart.plotContainer.width()
    );
    return this.xAxis.positionToValue(position);
  }

  getYposition() {
    var x = this.resizeButton2.x();
    var position = this.xAxis.toAxisPosition(
      x / this.chart.plotContainer.width()
    );
    return this.xAxis.positionToValue(position);
  }

  getFromDate() {
    return new Date(this.getXposition());
  }
  getToDate() {
    return new Date(this.getYposition());
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
      var value = this.getYposition();
      this.range2.set('value', value);
      this.range1.set('endValue', value);
    });

    // get the value when drag stops
    this.resizeButton2.events.on('dragstop', () => {
      console.log('DRAGSTOP TO', this.getToDate());
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

  range1!: am5.DataItem<am5xy.IDateAxisDataItem>;
  range2!: am5.DataItem<am5xy.IDateAxisDataItem>;
  primaryButtonColor!: am5.Color;
  addSessions() {
    var rangeDate = new Date();
    am5.time.add(
      rangeDate,
      'day',
      Math.round(this.series.dataItems.length / 2)
    );
    var rangeTime1 = rangeDate.getTime() - am5.time.getDuration('day') * 20;
    var rangeTime2 = rangeDate.getTime() + am5.time.getDuration('day') * 20;

    // add axis range 1
    this.range1 = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));

    this.range1.set('value', rangeTime1);
    this.range1.set('endValue', rangeTime2);

    this.range1.get('grid')?.setAll({
      strokeOpacity: 1,
      stroke: am5.color(0x00ff00),
    });

    // add axis range 2
    this.range2 = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));

    this.range2.set('value', rangeTime2);
    this.range2.get('grid')?.setAll({
      strokeOpacity: 1,
      stroke: am5.color(0x00ff00),
    });

    var axisFill = this.range1.get('axisFill');
    axisFill?.setAll({
      fillOpacity: 0.15,
      fill: am5.color(0x00ff00),
      visible: true,
      draggable: true, // se true deve gesture dragstop
    });

    // restrict from being dragged vertically
    axisFill?.adapters.add('y', function () {
      return 0;
    });

    axisFill?.events.on('dragstop', () => {
      var dx = axisFill?.x();
      if (!dx) return;
      var x = this.resizeButton1.x() + dx;
      var position = this.xAxis.toAxisPosition(
        x / this.chart.plotContainer.width()
      );
      var endPosition = this.xAxis.toAxisPosition(
        (x + (axisFill?.width() || 0)) / this.chart.plotContainer.width()
      );

      var value = this.xAxis.positionToValue(position);
      var endValue = this.xAxis.positionToValue(endPosition);

      console.log('selected range', new Date(value), new Date(endValue));

      this.range1.set('value', value);
      this.range1.set('endValue', endValue);
      this.range2.set('value', endValue);

      axisFill?.set('x', 0);
    });
  }

  initChart() {
    this.root = am5.Root.new('chartdiv');

    this.root.setThemes([am5themes_Animated.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
      })
    );
  }

  // Add cursor
  addCursor() {
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    this.cursor = this.chart.set(
      'cursor',
      am5xy.XYCursor.new(this.root, {
        behavior: 'selectX',
      })
    );
    this.cursor.lineY.set('visible', false);
  }

  createAxes() {
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    this.xAxis = this.chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: 'day',
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(this.root, {}),
        // tooltip: am5.Tooltip.new(root, {}),
      })
    );

    this.yAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        baseInterval: {
          timeUnit: 'day',
          count: 1,
        },
      })
    );
  }

  rangeSelectionEvents() {
    let selectStatedX: any;

    this.cursor.events.on('selectstarted', () => {
      selectStatedX = this.cursor.getPrivate('positionX');
    });

    this.cursor.events.on('selectended', () => {
      let selectEndedX = this.cursor.getPrivate('positionX') || 0;

      let startValue = this.xAxis.positionToValue(
        this.xAxis.toAxisPosition(selectStatedX)
      );
      let endValue = this.xAxis.positionToValue(
        this.xAxis.toAxisPosition(selectEndedX)
      );

      // flip if start > end
      if (startValue > endValue) {
        [startValue, endValue] = [endValue, startValue];
      }

      let skip = false;
      // check for overlapping
      let len = this.xAxis.axisRanges.length;
      for (var i = len - 1; i >= 0; i--) {
        let axisRange = this.xAxis.axisRanges.getIndex(i);
        let axisRangeStartValue = axisRange?.get('value') || 0;
        let axisRangeEndValue = axisRange?.get('endValue') || 0;
        // flip if start > end
        if (axisRangeStartValue > axisRangeEndValue) {
          [axisRangeStartValue, axisRangeEndValue] = [
            axisRangeEndValue,
            axisRangeStartValue,
          ];
        }

        // if both end and start values are within old range, do not do anything
        if (
          startValue >= axisRangeStartValue &&
          startValue <= axisRangeEndValue &&
          endValue >= axisRangeStartValue &&
          endValue <= axisRangeEndValue
        ) {
          skip = true;
        } else {
          if (
            startValue >= axisRangeStartValue &&
            startValue <= axisRangeEndValue
          ) {
            startValue = axisRangeEndValue;
          }

          if (
            endValue >= axisRangeStartValue &&
            endValue <= axisRangeEndValue
          ) {
            endValue = axisRangeStartValue;
          }
        }

        // if a new range takes within itself whole old range, remove old range
        if (
          axisRange &&
          startValue <= axisRangeStartValue &&
          endValue >= axisRangeEndValue
        ) {
          this.xAxis.axisRanges.removeValue(axisRange);
        }
      }

      const primaryButtonColor = this.root.interfaceColors.get('primaryButton');

      if (!skip) {
        let dataItem = this.xAxis.makeDataItem({});
        dataItem.set('value', startValue);
        dataItem.set('endValue', endValue);

        this.xAxis.createAxisRange(dataItem);
        dataItem.get('axisFill')?.setAll({
          fill: primaryButtonColor, //am5.color(0x00ff00),//chart.get('colors')?.getIndex(8),
          fillOpacity: 0.4,
          visible: true,
        });
        dataItem.get('grid')?.set('forceHidden', true);
      }

      this.cursor.selection.hide();
    });
  }

  // Add series
  addSeries() {
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/

    this.series = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: 'Series',
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        valueYField: 'value',
        valueXField: 'date',
        // tooltip: am5.Tooltip.new(root, {
        //   labelText: '{valueY}',
        // }),
      })
    );

    // Set data
    let data = this.generateDatas(1200);
    this.series.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    this.series.appear(1000);
    this.chart.appear(1000, 100);

    // Fill series
    this.series.fills.template.setAll({
      fillOpacity: 0.2,
      visible: true,
    });
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

  generateData() {
    let value = Math.round(Math.random() * 10 - 5 + this.value);
    am5.time.add(this.date, 'day', 1);
    return {
      date: this.date.getTime(),
      value: value,
    };
  }

  generateDatas(count: any) {
    let data = [];
    for (var i = 0; i < count; ++i) {
      data.push(this.generateData());
    }
    return data;
  }

  ngOnDestroy() {
    // Clean up root element when the component is removed
    this.browserOnly(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }
}
