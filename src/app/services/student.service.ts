import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  apiUrl = 'http://localhost:3000/students';

  constructor(private http: HttpClient) {}

  addStudent(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  getStudents() {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateStudent(id: string, student: any) {
    return this.http.put(`${this.apiUrl}/${id}`, student);
  }

 deleteStudent(id:string){
return this.http.delete(`${this.apiUrl}/${id}`);
}
}
