import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PresetItem } from '../model/model';
import { ConfigStoreService } from '../services/config-store.service';
import { RangeStoreService } from '../services/range-store.service';
import { pickerOverlayAnimations } from './picker-overlay.animations';

@Component({
  selector: 'ngx-mat-drp-picker-overlay',
  templateUrl: './picker-overlay.component.html',
  styleUrls: ['./picker-overlay.component.css'],
  animations: [pickerOverlayAnimations.transformPanel],
  encapsulation: ViewEncapsulation.None
})
export class PickerOverlayComponent implements OnInit {
  fromDate: Date;
  toDate: Date;
  fromMinDate: Date;
  fromMaxDate: Date;
  toMinDate: Date;
  toMaxDate: Date;
  presets: Array<PresetItem> = [];
  startDatePrefix: string;
  endDatePrefix: string;
  applyLabel: string;
  cancelLabel: string;
  shouldAnimate: string;

  constructor(
    private rangeStoreService: RangeStoreService,
    private configStoreService: ConfigStoreService,
    private overlayRef: OverlayRef
  ) {}

  ngOnInit() {
    this.fromDate = this.rangeStoreService.fromDate;
    this.toDate = this.rangeStoreService.toDate;
    this.startDatePrefix = this.configStoreService.ngxDrpOptions.startDatePrefix || 'FROM:';
    this.endDatePrefix = this.configStoreService.ngxDrpOptions.endDatePrefix || 'TO:';
    this.applyLabel = this.configStoreService.ngxDrpOptions.applyLabel || 'Apply';
    this.cancelLabel = this.configStoreService.ngxDrpOptions.cancelLabel || 'Cancel';
    this.presets = this.configStoreService.ngxDrpOptions.presets;
    this.shouldAnimate = this.configStoreService.ngxDrpOptions.animation 
      ? 'enter'
      : 'noop';
    ({
      fromDate: this.fromMinDate,
      toDate: this.fromMaxDate
    } = this.configStoreService.ngxDrpOptions.fromMinMax);
    ({
      fromDate: this.toMinDate,
      toDate: this.toMaxDate
    } = this.configStoreService.ngxDrpOptions.toMinMax);
  }

  updateFromDate(date, isPresetUpdate: boolean) {
    this.fromDate = date;
    this._toDateHandler(isPresetUpdate);
  }

  updateToDate(date, isPresetUpdate: boolean) {
    this.toDate = date;
    this._toDateHandler(isPresetUpdate);
  }

  _toDateHandler(isPresetUpdate: boolean) {
    if (!this.configStoreService.ngxDrpOptions.enforceToAfterFrom) {
        return;
    }
    if (!isPresetUpdate && this.fromDate > this.toDate) {
        this.toDate = this.fromDate;
        this.rangeStoreService.rangeError('The from date must be before the to date');
    }
    // toMinDate is undefined in the calendar wrapper on user click of fromDate, need toMinDate set to have reactive 'to' calendar enable & disable of days
    this.toMinDate = this.fromDate;
    // toMaxDate can be undefined, let the user define for their app
    this.configStoreService.ngxDrpOptions.toMinMax = { fromDate: this.fromDate, toDate: this.toMaxDate};
  }

  updateRangeByPreset(presetItem: PresetItem) {
    this.updateFromDate(presetItem.range.fromDate, true);
    this.updateToDate(presetItem.range.toDate, true);
  }

  applyNewDates(e) {
    this.rangeStoreService.updateRange(this.fromDate, this.toDate);
    this.disposeOverLay();
  }

  discardNewDates(e) {
    // this.rangeStoreService.updateRange();
    this.disposeOverLay();
  }

  private disposeOverLay() {
    this.overlayRef.dispose();
  }
}
