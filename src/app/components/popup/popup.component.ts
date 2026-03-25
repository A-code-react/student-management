import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PopupService, PopupData } from '../../services/popup.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent implements OnInit {
  popupData: PopupData = { message: '', type: 'info', visible: false };

  constructor(private popupService: PopupService) {}

  ngOnInit() {
    this.popupService.popup$.subscribe(data => {
      this.popupData = data;
    });
  }

  close() {
    this.popupService.hide();
  }
}