import * as am5 from '@amcharts/amcharts5';
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChartUtilsService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private zone: NgZone
  ) {
    // this.date.setHours(0, 0, 0, 0);
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  date = new Date();
  bpm = 100;
  vo2 = 100;
  generateData() {
    this.bpm = Math.round(Math.random() * 10 - 5 + this.bpm);
    this.vo2 = Math.round(Math.random() * 10 - 5 + this.vo2);
    am5.time.add(this.date, 'second', 3);
    return {
      date: this.date.getTime(),
      bpm: this.bpm,
      vo2: this.vo2,
    };
  }

  generateDatas(count: any = 600) {
    let data = [];
    for (var i = 0; i < count; ++i) {
      data.push(this.generateData());
    }
    return data;
  }
}
