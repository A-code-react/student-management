import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PopupData {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupSubject = new BehaviorSubject<PopupData>({ message: '', type: 'info', visible: false });
  public popup$ = this.popupSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.popupSubject.next({ message, type, visible: true });
    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hide();
    }, 3000);
  }

  hide() {
    this.popupSubject.next({ message: '', type: 'info', visible: false });
  }
}