import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';
import { SmoothedXYLineSeries } from '@amcharts/amcharts5/xy';
import { Injectable } from '@angular/core';
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
        panX: false,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
      })
    );

    this.createAxes();

    this.addSeries();
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
}
