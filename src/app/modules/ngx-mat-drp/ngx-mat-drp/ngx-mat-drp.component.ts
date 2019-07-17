import { OverlayRef } from '@angular/cdk/overlay';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxDrpOptions, Range } from '../model/model';
import { CalendarOverlayService } from '../services/calendar-overlay.service';
import { ConfigStoreService } from '../services/config-store.service';
import { RangeStoreService } from '../services/range-store.service';

@Component({
  selector: 'ngx-mat-drp',
  templateUrl: './ngx-mat-drp.component.html',
  styleUrls: ['./ngx-mat-drp.component.css'],
  providers: [
    CalendarOverlayService,
    RangeStoreService,
    ConfigStoreService,
    DatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxMatDrpComponent implements OnInit, OnDestroy {
  @ViewChild('calendarInput', { static: true })
  calendarInput;
  @Output()
  readonly selectedDateRangeChanged: EventEmitter<Range> = new EventEmitter<Range>();
  @Output()
  readonly errorMessage: EventEmitter<string> = new EventEmitter<string>();
  @Input()
  options: NgxDrpOptions;
  selectedDateRange = '';
  private _subscriptions: Subscription[] = [];
  overlayRef: OverlayRef;

  constructor(
    private changeDetectionRef: ChangeDetectorRef,
    private calendarOverlayService: CalendarOverlayService,
    public rangeStoreService: RangeStoreService,
    public configStoreService: ConfigStoreService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.configStoreService.ngxDrpOptions = this.options;
    this.options.placeholder = this.options.placeholder || 'Choose a date';
    const rangeUpdate$ = this.rangeStoreService.rangeUpdate$.subscribe(range => {
      const from: string = this.formatToDateString(
        range.fromDate,
        this.options.format
      );
      const to: string = this.formatToDateString(
        range.toDate,
        this.options.format
      );
      this.selectedDateRange = `${from} - ${to}`;
      this.selectedDateRangeChanged.emit(range);
    });
    this._subscriptions.push(rangeUpdate$);
    
    this.rangeStoreService.updateRange(
      this.options.range.fromDate,
      this.options.range.toDate
    );
    
    const rangeError$ = this.rangeStoreService.rangeError$.subscribe(msg => {
        this.errorMessage.emit(msg);
    });
    this._subscriptions.push(rangeError$);
    
    this.changeDetectionRef.detectChanges();
  }

  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  private formatToDateString(date: Date, format: string): string {
    return this.datePipe.transform(date, format);
  }

  openCalendar(event) {
    this.overlayRef = this.calendarOverlayService.open(
      this.options.calendarOverlayConfig,
      this.calendarInput
    );
  }

  closeCalendar() {
    if (this.overlayRef) {
        this.overlayRef.dispose();
    }
  }

  public resetDates(range: Range) {
    this.rangeStoreService.updateRange(
      range.fromDate,
      range.toDate
    );
  }
}
