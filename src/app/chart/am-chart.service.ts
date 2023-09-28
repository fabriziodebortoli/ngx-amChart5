import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';
import { SmoothedXYLineSeries } from '@amcharts/amcharts5/xy';
import { Injectable } from '@angular/core';
import { Session, Training } from '../models';
import { ChartUtilsService } from './chart-utils.service';

export enum ChartModes {
  EditRange = 'editRange',
  EditSession = 'editSession',
  AddSession = 'addSession',
  Readonly = 'readonly',
}

const _MIN_RANGE_WIDTH = 1;

@Injectable()
export class AmChartService {
  private root!: am5.Root;
  private chart!: am5xy.XYChart;
  private cursor!: am5xy.XYCursor;
  private xAxis!: am5xy.DateAxis<am5xy.AxisRendererX>;
  private yAxis!: am5xy.DateAxis<am5xy.AxisRendererY>;
  private BPMserie!: SmoothedXYLineSeries;
  private VO2serie!: SmoothedXYLineSeries;
  private maxNextRangePosition = 0;
  private maxPrevRangePosition = 0;
  private sessionColor = am5.color('#858247');
  private buttonColor = am5.color('#1c1d20');

  private mode: ChartModes = ChartModes.Readonly;

  training!: Training;

  constructor(private chartUtilsService: ChartUtilsService) {}

  initChart(id: string = 'chartdiv') {
    this.root = am5.Root.new(id);

    this.root.setThemes([am5themes_Animated.new(this.root)]);

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        pinchZoomX: false,
      })
    );

    this.createAxes();
    // this.addScrollbar();

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

    this.cursor = this.chart.set(
      'cursor',
      am5xy.XYCursor.new(this.root, {
        behavior: 'none',
      })
    );
    this.cursor.lineY.set('visible', false);
  }

  addBPMSerie() {
    let tooltip = am5.Tooltip.new(this.root, {
      getFillFromSprite: false,
      labelText: '[bold]BPM[/]: {bpmReal}',
      autoTextColor: false,
    });
    tooltip.get('background')?.setAll({
      fill: am5.color('#D32F2F'),
      fillOpacity: 1,
    });

    this.BPMserie = this.chart.series.push(
      am5xy.SmoothedXYLineSeries.new(this.root, {
        name: 'BPM',
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        valueYField: 'bpm',
        valueXField: 'date',
        stroke: am5.color('#D32F2F'),
        tooltip: tooltip,
      })
    );

    this.BPMserie.appear(1000);
  }

  addVO2Serie() {
    let tooltip = am5.Tooltip.new(this.root, {
      getFillFromSprite: false,
      labelText: '[bold]VO2[/]: {vo2Real}',
      autoTextColor: false,
    });
    tooltip.get('background')?.setAll({
      fill: am5.color('#303F9F'),
      fillOpacity: 1,
    });

    this.VO2serie = this.chart.series.push(
      am5xy.SmoothedXYLineSeries.new(this.root, {
        name: 'VO2',
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        valueYField: 'vo2',
        valueXField: 'date',
        stroke: am5.color('#303F9F'),
        tooltip: tooltip,
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

  setTrainingData(Training: Training) {
    this.training = Training;
    const sessions = Training.sessions;
    console.log('ORIG sessions', sessions);

    sessions?.forEach((session) => {
      this.addSession(session);
    });

    this.maxNextRangePosition = this.chart.plotContainer.width();
    this.maxPrevRangePosition = 0;
  }

  addSession(session: Session) {
    const fromTime = new Date(session.startedAt).getTime();
    const toTime = new Date(session.stoppedAt).getTime();

    // Linee range sessione
    let rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>;
    rangeFrom = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));
    rangeFrom.set('value', fromTime);
    rangeFrom.set('endValue', toTime);
    rangeFrom.set('affectsMinMax', true);
    rangeFrom.get('grid')?.setAll({
      strokeOpacity: 0.4,
      stroke: this.sessionColor,
    });

    // Range linea finale sessione (per allineare resize button)
    let rangeTo: am5.DataItem<am5xy.IDateAxisDataItem>;
    rangeTo = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));
    rangeTo.set('value', toTime);
    rangeTo.set('affectsMinMax', true);
    rangeTo.get('grid')?.setAll({
      strokeOpacity: 0.4,
      stroke: this.sessionColor,
    });

    // Riempimento colore sessione
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

    this.manageResizeButtons(rangeFrom, rangeTo);

    // if (this.mode === ChartModes.EditSession) {
    //   setTimeout(
    //     () => this.addEditSessionButton(session, rangeFrom, rangeTo),
    //     100
    //   );
    // }
  }

  addButtons() {
    const allRanges = [
      this.xAxis.positionToValue(0), // start training value
      ...this.getAllRanges(), // values of start and end of sessions
      this.xAxis.positionToValue(1), // stop training value
    ];
    console.log('allRanges', allRanges);

    // create button for each range
    allRanges.forEach((value, index) => {
      if (index === allRanges.length - 1) return;

      // calculate center of range
      const centerRange =
        (allRanges[index + 1] - allRanges[index]) / 2 + allRanges[index];

      // create range in centerRange
      let buttonRange: am5.DataItem<am5xy.IDateAxisDataItem>;
      buttonRange = this.xAxis.createAxisRange(this.xAxis.makeDataItem({}));
      buttonRange.set('value', centerRange);

      // check if range is in a session to show "edit session" button or in a gap to show "new session" button
      const inSession = this.inSession(centerRange);
      let button: am5.Button;
      if (inSession) {
        // show "edit button"
        button = this.createEditSessionButton(index);
      } else {
        // show "new button"
        button = this.createNewSessionButton(index);
      }

      // add button to range
      buttonRange.set(
        'bullet',
        am5xy.AxisBullet.new(this.root, {
          sprite: button,
        })
      );
    });
  }

  // check se range è all'interno di una sessione
  inSession(centerRange: number): boolean {
    if (!this.training?.sessions) return false;
    for (const session of this.training?.sessions) {
      const startedAt = new Date(session.startedAt).getTime();
      const stoppedAt = new Date(session.stoppedAt).getTime();

      if (centerRange >= startedAt && centerRange <= stoppedAt) {
        return true; // centerRange è all'interno di una sessione
      }
    }

    return false; // centerRange non è all'interno di nessuna sessione
  }

  // create "edit session" button
  createEditSessionButton(id: number) {
    let button: am5.Button;
    button = am5.Button.new(this.root, {
      label: am5.Label.new(this.root, {
        text: 'EDIT',
        fontSize: 14,
        fontWeight: '600',
        paddingTop: 2,
        paddingRight: 2,
        paddingBottom: 2,
        paddingLeft: 2,
        fill: this.buttonColor,
      }),
      centerX: am5.percent(50),
      centerY: am5.percent(110),
      id: 'edit-session-' + id,
    });

    button.get('background')?.setAll({
      fill: am5.color("#fff"),
      fillOpacity: 0.7,
      stroke: this.buttonColor,
    });

    button.get("background")?.states.create("hover", {}).setAll({
      fill: am5.color("#eee"),
      fillOpacity: 1
    });

    button.get("background")?.states.create("down", {}).setAll({
      fill: am5.color("#ccc"),
      fillOpacity: 0.5
    });

    return button;
  }

  // create "new session" button
  createNewSessionButton(id: number) {
    let button: am5.Button;

    button = am5.Button.new(this.root, {
      label: am5.Label.new(this.root, {
        text: 'NEW',
        fontSize: 14,
        fontWeight: '600',
        paddingTop: 2,
        paddingRight: 2,
        paddingBottom: 2,
        paddingLeft: 2,
      }),
      centerX: am5.percent(50),
      centerY: am5.percent(110),
      id: 'new-session-' + id,
    });

    button.get('background')?.setAll({
      fill: this.buttonColor,
      fillOpacity: 0.7,
    });

    button.get("background")?.states.create("hover", {}).setAll({
      fill: this.buttonColor,
      fillOpacity: 1
    });

    button.get("background")?.states.create("down", {}).setAll({
      fill: this.buttonColor,
      fillOpacity: 0.5
    });

    return button;
  }

  // Crea e gestisce i resize buttons
  manageResizeButtons(
    rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>,
    rangeTo: am5.DataItem<am5xy.IDateAxisDataItem>
  ) {
    let resizeButtonFrom!: am5.Button;
    let resizeButtonTo!: am5.Button;

    resizeButtonFrom = am5.Button.new(this.root, {
      themeTags: ['resize', 'horizontal'],
      icon: am5.Graphics.new(this.root, {
        themeTags: ['icon'],
      }),
    });

    resizeButtonTo = am5.Button.new(this.root, {
      themeTags: ['resize', 'horizontal'],
      icon: am5.Graphics.new(this.root, {
        themeTags: ['icon'],
      }),
    });

    this.createFromButton(resizeButtonFrom, rangeFrom);
    this.createToButton(resizeButtonTo, rangeFrom, rangeTo);

    this.limitRangeSelection(
      resizeButtonFrom,
      resizeButtonTo,
      rangeFrom,
      rangeTo
    );
  }

  // limita il drag dei resize buttons allo spazio disponibile tra i range e il container
  limitRangeSelection(
    resizeButtonFrom: am5.Button,
    resizeButtonTo: am5.Button,
    rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>,
    rangeTo: am5.DataItem<am5xy.IDateAxisDataItem>
  ) {
    // restrict from being dragged from sessionTo and prev session or outside of plot
    resizeButtonFrom.adapters.add('x', (x) => {
      if (!x) return 0;

      // posizione della fine del range corrente
      const positionTo = this.getPositionFromRange(rangeTo) - _MIN_RANGE_WIDTH;

      // posizione limite sinistra 0 oppure range precedente + _MIN_RANGE_WIDTH
      const minLeft = this.maxPrevRangePosition;

      return Math.max(minLeft, Math.min(positionTo, +x));
    });

    // restrict from being dragged from sessionFrom and next session or outside of plot
    resizeButtonTo.adapters.add('x', (x) => {
      if (!x) return 0;

      // posizione dell'inizio del range corrente
      const positionFrom =
        this.getPositionFromRange(rangeFrom) + _MIN_RANGE_WIDTH;

      // posizione limite destra plotContainer.width() oppure range successivo - _MIN_RANGE_WIDTH
      const maxRight = this.maxNextRangePosition;

      return Math.max(positionFrom, Math.min(maxRight, +x));
    });
  }

  /**
   * Ottiene la posizione del range successivo a quello corrente
   * @param rangeTo range corrente
   * @returns posizione del range successivo a quello corrente
   */
  getMaxNextRangePosition(rangeTo: am5.DataItem<am5xy.IDateAxisDataItem>) {
    // prendo tutti i range presenti nel chart, li filtro per quelli che hanno un value maggiore di quello corrente e prendo il minimo
    // Ottieni tutti i range definiti sull'asse delle date
    const allMajorRanges = this.getAllRanges().filter(
      (range) => range > (rangeTo.get('value') || 0)
    );
    // console.log('allMajorRanges', allMajorRanges);
    // console.log('Math.min(...allMajorRanges)', Math.min(...allMajorRanges));

    // Se non ci sono range successivi, il limite è plotContainer.width()
    if (allMajorRanges.length === 0) return this.chart.plotContainer.width();

    const maxNextRange = Math.min(...allMajorRanges);

    // Posizione limite destra plotContainer.width() oppure range successivo - _MIN_RANGE_WIDTH
    const maxNextRangePosition =
      this.getPositionFromValue(maxNextRange) - _MIN_RANGE_WIDTH;

    return maxNextRangePosition;
  }

  /**
   * Ottiene la posizione del range precedente a quello corrente
   * @param rangeFrom range corrente
   * @returns posizione del range precedente a quello corrente
   */
  getMaxPrevRangePosition(rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>) {
    // prendo tutti i range presenti nel chart, li filtro per quelli che hanno un endValue minore di quello corrente e prendo il massimo
    // Ottieni tutti i range definiti sull'asse delle date
    const allMinorRanges = this.getAllRanges().filter(
      (range) => range < (rangeFrom.get('value') || 0)
    );
    // Se non ci sono range precedenti, il limite è 0
    const maxPrevRange = Math.max(0, Math.max(...allMinorRanges));
    // Posizione limite sinistra 0 oppure range precedente + _MIN_RANGE_WIDTH
    const maxPrevRangePosition =
      maxPrevRange === 0
        ? 0
        : this.getPositionFromValue(maxPrevRange) + _MIN_RANGE_WIDTH;

    return maxPrevRangePosition;
  }

  /**
   * Crea il resize button per il range corrente
   * @param resizeButtonFrom
   * @param rangeFrom
   */
  createFromButton(
    resizeButtonFrom: am5.Button,
    rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>
  ) {
    // restrict from being dragged vertically
    resizeButtonFrom.adapters.add('y', function () {
      return 0;
    });

    resizeButtonFrom.events.on('dragstart', () => {
      this.maxPrevRangePosition = this.getMaxPrevRangePosition(rangeFrom);
      console.log(
        'DRAGSTART FROM maxPrevRangePosition set:',
        this.maxPrevRangePosition
      );
    });

    // change range when x changes
    resizeButtonFrom.events.on('dragged', () => {
      rangeFrom.set('value', this.getButtonXPosition(resizeButtonFrom));
    });

    // get the value when drag stops
    resizeButtonFrom.events.on('dragstop', () => {
      this.resetLimits();
      console.log(
        'DRAGSTOP FROM',
        this.getButtonDateFrom(resizeButtonFrom),
        this.getPositionFromRange(rangeFrom)
      );

      this.saveRanges();
    });

    if (this.mode === ChartModes.EditRange) {
      // set bullet for the range
      rangeFrom.set(
        'bullet',
        am5xy.AxisBullet.new(this.root, {
          location: 0,
          sprite: resizeButtonFrom,
        })
      );
    }
  }

  /**
   * Crea il resize button per il range successivo a quello corrente
   * @param resizeButtonTo
   * @param rangeFrom
   * @param rangeTo
   */
  createToButton(
    resizeButtonTo: am5.Button,
    rangeFrom: am5.DataItem<am5xy.IDateAxisDataItem>,
    rangeTo: am5.DataItem<am5xy.IDateAxisDataItem>
  ) {
    // restrict from being dragged vertically
    resizeButtonTo.adapters.add('y', function () {
      return 0;
    });

    resizeButtonTo.events.on('dragstart', () => {
      this.maxNextRangePosition = this.getMaxNextRangePosition(rangeTo);
      console.log(
        'DRAGSTART TO maxNextRangePosition set:',
        this.maxNextRangePosition
      );
    });

    // change range when x changes
    resizeButtonTo.events.on('dragged', () => {
      var value = this.getButtonXPosition(resizeButtonTo);
      rangeTo.set('value', value);
      rangeFrom.set('endValue', value);
    });

    // get the value when drag stops
    resizeButtonTo.events.on('dragstop', () => {
      this.resetLimits();
      console.log(
        'DRAGSTOP TO',
        this.getButtonDateTo(resizeButtonTo),
        this.getPositionFromRange(rangeTo)
      );

      this.saveRanges();
    });

    if (this.mode === ChartModes.EditRange) {
      // set bullet for the range
      rangeTo.set(
        'bullet',
        am5xy.AxisBullet.new(this.root, {
          sprite: resizeButtonTo,
        })
      );
    }
  }

  resetLimits() {
    setTimeout(() => {
      this.maxNextRangePosition = this.chart.plotContainer.width();
      this.maxPrevRangePosition = 0;
    }, 200);
  }

  clearRanges() {
    this.xAxis.axisRanges.clear();
  }

  drawRanges() {
    console.log('drawRanges');
  }

  refreshChart() {
    this.clearRanges();
    this.setTrainingData(this.training);

    if (this.mode === ChartModes.EditSession) {
      this.addButtons();
    }
  }

  setEditRangeMode() {
    this.setMode(ChartModes.EditRange);
  }

  setEditSessionMode() {
    this.setMode(ChartModes.EditSession);
  }

  setReadonlyMode() {
    this.setMode(ChartModes.Readonly);
  }

  setMode(mode: ChartModes) {
    this.saveRanges();
    this.mode = mode;
    this.refreshChart();
  }

  saveRanges() {
    const ranges = this.getAllRanges();

    let sessions = this.training?.sessions;
    // console.log('OLD sessions', sessions);

    let idx = 0;
    sessions?.forEach((session, index) => {
      session.duration = this.getDurationFromRange(
        ranges[idx],
        ranges[idx + 1]
      );
      session.startedAt = new Date(ranges[idx]).toISOString();
      idx++;
      session.stoppedAt = new Date(ranges[idx]).toISOString();
      idx++;
    });
    // console.log('SAVED sessions', sessions);
  }

  getDurationFromRange(rangeFrom: number, rangeTo: number) {
    rangeTo = new Date(rangeTo).getTime();
    rangeFrom = new Date(rangeFrom).getTime();
    return Math.floor((rangeTo - rangeFrom) / 1000);
  }

  getAllRanges(): number[] {
    const ranges = this.xAxis.axisRanges.values.map(
      (range) => range._settings.value || 0
    );
    return ranges;
  }

  getAllRangesPx(): number[] {
    return this.getAllRanges().map((range) => this.getPositionFromValue(range));
  }

  getPositionFromRange(range: am5.DataItem<am5xy.IDateAxisDataItem>) {
    const pxTo = this.xAxis.valueToPosition(range.get('value') || 0);
    let position = this.xAxis.toAxisPosition(pxTo);
    position = this.chart.plotContainer.width() * pxTo;
    return position;
  }

  getPositionFromValue(value: number) {
    const pxTo = this.xAxis.valueToPosition(value);
    let position = this.xAxis.toAxisPosition(pxTo);
    position = this.chart.plotContainer.width() * pxTo;
    return Math.floor(position);
  }
}
