import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  // STUDENTS APIs
  addStudent(data: any) {
    return this.http.post(`${this.apiUrl}/students`, data);
  }

  getStudents() {
    return this.http.get<any[]>(`${this.apiUrl}/students`);
  }

  updateStudent(id: string, student: any) {
    return this.http.put(`${this.apiUrl}/students/${id}`, student);
  }

  deleteStudent(id: string) {
    return this.http.delete(`${this.apiUrl}/students/${id}`);
  }

  // LOGIN API
  login(data: any) {
    return this.http.post<any>(
      `${this.apiUrl}/principals/login`, data)
      }
  getStates() {
    return this.http.get<any[]>(`${this.apiUrl}/states`);
  }
  getStudentById(id: string) {
  return this.http.get(`${this.apiUrl}/students/${id}`);
}
 
}
