import { Component, OnInit } from '@angular/core'; 
import { BaseChartDirective } from 'ng2-charts';
import { StudentService } from '../../services/student.service';
import { CommonModule } from '@angular/common';
import { DashboardFilterService } from '../../services/dashboard-filter.service';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';
Chart.register(...registerables);
@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent {
students: any[] = [];
departmentLabels: string[] = [];
departmentData: number[] = [];
statusLabels: string[] = ['PASS', 'ATKT', 'FAIL'];
statusData: number[] = [0, 0, 0];
topStudentLabels: string[] = [];
topStudentData: number[] = [];
totalStudents: number = 0;
passCount: number = 0;
atktCount: number = 0;
failCount: number = 0;
departmentPerformanceLabels: string[] = [];
departmentPerformanceData: number[] = [];
constructor(private studentService: StudentService,
  private dashboardFilter: DashboardFilterService,
private router: Router) {}

ngOnInit() {
  this.loadStudents();
}


loadStudents() {
  this.studentService.getStudents().subscribe((data: any) => { 

    this.students = data;

    this.calculateSummary();
    this.prepareDepartmentChart();
    this.prepareStatusChart();
    this.prepareTopStudentsChart();
this.prepareDepartmentPerformanceChart();
  });

}
prepareDepartmentChart() {

  const departmentCount: any = {};

  this.students.forEach(student => {
    const dept = student.department;

    if (!departmentCount[dept]) {
      departmentCount[dept] = 0;
    }

    departmentCount[dept]++;
  });

  this.departmentLabels = Object.keys(departmentCount);
  this.departmentData = Object.values(departmentCount);

}
prepareStatusChart() {

  let pass = 0;
  let atkt = 0;
  let fail = 0;

  this.students.forEach(student => {

    const marks = Object.values(student.subjects || {}) as number[];

    const failedSubjects = marks.filter(m => m < 35).length;

    if (failedSubjects === marks.length) {
      fail++;
    } else if (failedSubjects > 0) {
      atkt++;
    } else {
      pass++;
    }

  });

  this.statusData = [pass, atkt, fail];

}
prepareTopStudentsChart() {

  const topStudents = [...this.students]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  this.topStudentLabels = topStudents.map(s => s.name);
  this.topStudentData = topStudents.map(s => s.percentage);

}
calculateSummary() {

  this.totalStudents = this.students.length;

  let pass = 0;
  let atkt = 0;
  let fail = 0;

  this.students.forEach(student => {

    if (!student.subjects) return;

    const marks = Object.values(student.subjects) as number[];

    const failedSubjects = marks.filter(m => m < 35).length;

    if (marks.length === 0) return;

    if (failedSubjects === marks.length) {
      fail++;
    } else if (failedSubjects > 0) {
      atkt++;
    } else {
      pass++;
    }

  });

  this.passCount = pass;
  this.atktCount = atkt;
  this.failCount = fail;
}

prepareDepartmentPerformanceChart() {

  const deptTotals: any = {};
  const deptCounts: any = {};

  this.students.forEach(student => {

    const dept = student.department;

    if (!deptTotals[dept]) {
      deptTotals[dept] = 0;
      deptCounts[dept] = 0;
    }

    deptTotals[dept] += student.percentage;
    deptCounts[dept]++;

  });

  const labels = [];
  const data = [];

  for (let dept in deptTotals) {

    const avg = deptTotals[dept] / deptCounts[dept];

    labels.push(dept);
    data.push(Number(avg.toFixed(2)));

  }

  this.departmentPerformanceLabels = labels;
  this.departmentPerformanceData = data;

}
onDepartmentChartClick(event: any) {

  if (event.active.length > 0) {

    const chartIndex = event.active[0].index;

    const department = this.departmentLabels[chartIndex];

    // send department filter
    this.dashboardFilter.setDepartment(department);

    // navigate to student list
   this.router.navigate(['/list-student'], {
  queryParams: { department: department }
});
  }

}

}
