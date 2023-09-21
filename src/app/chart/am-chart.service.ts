import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';
import { SmoothedXYLineSeries } from '@amcharts/amcharts5/xy';
import { Injectable } from '@angular/core';
import { Training } from '../models';
import { ChartUtilsService } from './chart-utils.service';

@Injectable()
export class AmChartService {
  private root!: am5.Root;
  private chart!: am5xy.XYChart;
  private cursor!: am5xy.XYCursor;
  private xAxis!: am5xy.DateAxis<am5xy.AxisRendererX>;
  private yAxis!: am5xy.DateAxis<am5xy.AxisRendererY>;
  private BPMserie!: SmoothedXYLineSeries;
  private VO2serie!: SmoothedXYLineSeries;

  constructor(private chartUtilsService: ChartUtilsService) {}

  initChart(id: string = 'chartdiv') {
    this.root = am5.Root.new(id);

    this.root.setThemes([am5themes_Animated.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: true,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
      })
    );

    this.createAxes();
    this.addScrollbar();

    this.addSeries();

    // this.rangeSelectionEvents();
  }

  // Create axes
  createAxes() {
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    this.xAxis = this.chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: 'second',
          count: 3,
        },
        renderer: am5xy.AxisRendererX.new(this.root, {}),
      })
    );

    this.yAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        baseInterval: {
          timeUnit: 'second',
          count: 3,
        },
      })
    );
  }

  addSeries() {
    this.addBPMSerie();
    this.addVO2Serie();
    this.chart.appear(1000, 100);
  }

  addBPMSerie() {
    this.BPMserie = this.chart.series.push(
      am5xy.SmoothedXYLineSeries.new(this.root, {
        name: 'BPM',
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        valueYField: 'bpm',
        valueXField: 'date',
        stroke: am5.color('#D32F2F'),
      })
    );

    this.BPMserie.appear(1000);
  }

  addVO2Serie() {
    this.VO2serie = this.chart.series.push(
      am5xy.SmoothedXYLineSeries.new(this.root, {
        name: 'VO2',
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        valueYField: 'vo2',
        valueXField: 'date',
        stroke: am5.color('#303F9F'),
      })
    );

    this.VO2serie.appear(1000);
  }

  setData(data: any) {
    // this.BPMserie.data.setAll(data);
    // this.VO2serie.data.setAll(data);
    this.chart.series.each((serie) => {
      serie.data.setAll(data);
    });

    console.log('data setted', data);
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

  getButtonXPosition(resizeButton: am5.Button) {
    var x = resizeButton.x();
    var position = this.xAxis.toAxisPosition(
      x / this.chart.plotContainer.width()
    );
    return this.xAxis.positionToValue(position);
  }

  getButtonDateFrom(button: am5.Button) {
    return new Date(this.getButtonXPosition(button));
  }

  getButtonDateTo(button: am5.Button) {
    return new Date(this.getButtonXPosition(button));
  }

  dispose() {
    if (this.root) {
      this.root.dispose();
    }
  }

  // gestione selezione range
  rangeSelectionEvents() {
    this.addCursor(); // Aggiunge cursore con range selection

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

  setTrainingData(data: Training) {
    const sessions = data.sessions;

    sessions?.forEach((session) => {
      this.addSession(session.startedAt, session.stoppedAt);
    });
  }

  addSession(from: Date, to: Date) {
    var rangeFrom1 = new Date(from).getTime();
    var rangeTo1 = new Date(to).getTime();
    this.drawSession(rangeFrom1, rangeTo1);
  }

  sessionColor = am5.color(0x00ff00);
  drawSession(from: number, to: number) {
    let rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>;
    rangeFrom = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));
    rangeFrom.set('value', from);
    rangeFrom.set('endValue', to);
    rangeFrom.get('grid')?.setAll({
      strokeOpacity: 1,
      stroke: this.sessionColor,
    });

    let rangeTo = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));
    rangeTo.set('value', to);
    rangeTo.get('grid')?.setAll({
      strokeOpacity: 1,
      stroke: this.sessionColor,
    });

    var axisFill = rangeFrom.get('axisFill');
    axisFill?.setAll({
      fillOpacity: 0.15,
      fill: this.sessionColor,
      visible: true,
      draggable: false,
    });
    // restrict from being dragged vertically
    axisFill?.adapters.add('y', function () {
      return 0;
    });

    let resizeButtonFrom!: am5.Button;
    let resizeButtonTo!: am5.Button;

    this.createFromButton(resizeButtonFrom, rangeFrom);
    this.createToButton(resizeButtonTo, rangeFrom, rangeTo);
  }

  createFromButton(
    resizeButtonFrom: am5.Button,
    rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>
  ) {
    resizeButtonFrom = am5.Button.new(this.root, {
      themeTags: ['resize', 'horizontal'],
      icon: am5.Graphics.new(this.root, {
        themeTags: ['icon'],
      }),
    });

    // restrict from being dragged vertically
    resizeButtonFrom.adapters.add('y', function () {
      return 0;
    });

    // restrict from being dragged outside of plot
    resizeButtonFrom.adapters.add('x', (x) => {
      if (!x) return 0;
      return Math.max(0, Math.min(this.chart.plotContainer.width(), +x));
    });

    // change range when x changes
    resizeButtonFrom.events.on('dragged', () => {
      rangeFrom.set('value', this.getButtonXPosition(resizeButtonFrom));
    });

    // get the value when drag stops
    resizeButtonFrom.events.on('dragstop', () => {
      console.log('DRAGSTOP FROM', this.getButtonDateFrom(resizeButtonFrom));
    });

    // set bullet for the range
    rangeFrom.set(
      'bullet',
      am5xy.AxisBullet.new(this.root, {
        location: 0,
        sprite: resizeButtonFrom,
      })
    );
  }

  createToButton(
    resizeButtonTo: am5.Button,
    rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>,
    rangeTo: am5.DataItem<am5xy.IDateAxisDataItem>
  ) {
    resizeButtonTo = am5.Button.new(this.root, {
      themeTags: ['resize', 'horizontal'],
      icon: am5.Graphics.new(this.root, {
        themeTags: ['icon'],
      }),
    });

    // restrict from being dragged vertically
    resizeButtonTo.adapters.add('y', function () {
      return 0;
    });

    // restrict from being dragged outside of plot
    resizeButtonTo.adapters.add('x', (x) => {
      if (!x) return 0;
      return Math.max(0, Math.min(this.chart.plotContainer.width(), +x));
    });

    // change range when x changes
    resizeButtonTo.events.on('dragged', () => {
      var value = this.getButtonXPosition(resizeButtonTo);
      rangeTo.set('value', value);
      rangeFrom.set('endValue', value);
    });

    // get the value when drag stops
    resizeButtonTo.events.on('dragstop', () => {
      console.log('DRAGSTOP TO', this.getButtonDateTo(resizeButtonTo));
    });

    // set bullet for the range
    rangeTo.set(
      'bullet',
      am5xy.AxisBullet.new(this.root, {
        sprite: resizeButtonTo,
      })
    );
  }
}
