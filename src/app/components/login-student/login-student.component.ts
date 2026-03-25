import { CommonModule } from '@angular/common';
import { StudentService } from './../../services/student.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupService } from '../../services/popup.service';

@Component({
  selector: 'app-login-student',
 imports: [CommonModule, FormsModule],
  templateUrl: './login-student.component.html',
  styleUrl: './login-student.component.css'
})
export class LoginStudentComponent {
  email: string = '';
  password: string = '';
  loginForm: any;

  constructor(private StudentService: StudentService, private router: Router, private popupService: PopupService) {}
login() {
  const payload = {
    email: this.email,
    password: this.password
  };

  this.StudentService.login(payload).subscribe({
    next: (res) => {
      // ✅ store token
      localStorage.setItem('token', res.token);
      localStorage.setItem('principal', JSON.stringify(res.user || res));

      this.popupService.show('Login successful', 'success');

      this.router.navigate(['/list-student']);
    },
    error: (err) => {
      this.popupService.show(err.error.message || 'Login failed', 'error');
    }
  });
}
}
