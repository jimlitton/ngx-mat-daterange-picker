import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Subject } from 'rxjs';
import { Range } from '../model/model';
/* import { DATE } from '../ngx-drp.module'; */

export const DATE = new InjectionToken<Date>('date');

@Injectable()
export class RangeStoreService {
  rangeUpdate$: Subject<Range> = new Subject<Range>();
  rangeError$: Subject<string> = new Subject<string>();

  constructor(
    @Inject(DATE) private _fromDate: Date,
    @Inject(DATE) private _toDate: Date
  ) {}

  /* set fromDate(fromDate:Date) {
    this._fromDate = fromDate;
  } */

  get fromDate(): Date {
    return this._fromDate;
  }

  /* set toDate(toDate:Date) {
    this._toDate = toDate;
  } */

  get toDate(): Date {
    return this._toDate;
  }

  updateRange(fromDate: Date = this._fromDate, toDate: Date = this._toDate) {
    this._fromDate = fromDate;
    this._toDate = toDate;
    this.rangeUpdate$.next({ fromDate: this._fromDate, toDate: this._toDate });
  }

//   fromDateChanged(date: Date) {
//     this._fromDate = date;
//   }

//   toDateChanged(date: Date) {
//     this._toDate = date;
//   }

  rangeError(message: string) {
    this.rangeError$.next(message);
  }
}
