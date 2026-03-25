import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardFilterService {

  private departmentFilter = new BehaviorSubject<string | null>(null);

  departmentFilter$ = this.departmentFilter.asObservable();

  setDepartment(dept: string) {
    this.departmentFilter.next(dept);
  }

}