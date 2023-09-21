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

  date = new Date("2023-09-07T14:00:00Z");
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

  generateDatas(count: any = 2400) {
    let data = [];
    for (var i = 0; i < count; ++i) {
      data.push(this.generateData());
    }
    return data;
  }

  convertToUnixTimestamp(dateString: string): number {
    // Converti la data in un oggetto Date
    const date = new Date(dateString);

    // Verifica se la conversione è avvenuta con successo
    if (isNaN(date.getTime())) {
      throw new Error('Data non valida');
    }

    // Ottieni il timestamp UNIX (in millisecondi) dalla data
    const unixTimestamp = date.getTime();

    // Converti il timestamp in secondi dividendo per 1000
    const unixTimestampInSeconds = Math.floor(unixTimestamp / 1000);

    return unixTimestampInSeconds;
  }

  addSecondsToDate(dateString: string, secondsToAdd: number): string {
    // Converti la data in un oggetto Date
    const date = new Date(dateString);

    // Aggiungi i secondi alla data
    date.setSeconds(date.getSeconds() + secondsToAdd);

    // Ottieni la nuova data come stringa nel formato ISO 8601
    const newDate = date.toISOString();

    return newDate;
  }
}
