import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupComponent } from './components/popup/popup.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, PopupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'student-management';

  isLoggedIn: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkLogin();
      }
    });
  }

ngOnInit() {
  this.checkLogin();
}

checkLogin() {
  const user = localStorage.getItem('principal');
  this.isLoggedIn = !!user;
}

logout() {
  localStorage.removeItem('principal');
  this.isLoggedIn = false;
  this.router.navigate(['/login']);
}

}
