import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AmChartService } from './chart/am-chart.service';
import { ChartUtilsService } from './chart/chart-utils.service';
import { Training } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AmChartService],
})
export class AppComponent {
  constructor(
    private http: HttpClient,
    private chartService: AmChartService,
    private chartUtils: ChartUtilsService
  ) {}

  ngAfterViewInit() {
    this.setTraining();
    this.setData();
  }

  setTraining() {
    this.http
      .get<Training>('assets/training-data.json')
      .subscribe((data: Training) => {
        this.chartService.setTrainingData(data);
      });
  }

  setData() {
    this.http.get('assets/data.json').subscribe((data: any) => {
      this.chartService.setData(data);
    });
    // let data = this.chartUtils.generateDatas();
    // console.log('data', data);
    // this.chartService.setData(data);
  }

  downloadJson() {
    var sJson = JSON.stringify(this.chartUtils.generateDatas());
    var element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson)
    );
    element.setAttribute('download', 'data.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click(); // simulate click
    document.body.removeChild(element);
  }

  getAllRanges() {
    const ranges = this.chartService.getAllRanges();
    console.log('ranges', ranges);
  }

  clearRanges() {
    this.chartService.clearRanges();
  }

  drawRanges() {
    this.chartService.drawRanges();
  }

  setReadonlyMode() {
    this.chartService.setReadonlyMode();
  }

  setEditRangeMode() {
    this.chartService.setEditRangeMode();
  }

  setEditSessionMode() {
    this.chartService.setEditSessionMode();
  }

  addNewSessionButtons() {
    this.chartService.addNewSessionButtons();
  }
}
