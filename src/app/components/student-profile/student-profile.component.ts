import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-profile',
  standalone: true,
   imports: [CommonModule],
  templateUrl: './student-profile.component.html',
})
export class StudentProfileComponent implements OnInit {

  student: any;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService
  ) {}
 
ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.studentService.getStudentById(id).subscribe((res: any) => {
      this.student = res;
    });
  }
}
  printProfile() {
    window.print();
  }
  getResult(student: any): string {
  const marks = Object.values(student.subjects) as number[];
  const failed = marks.filter(m => m < 35).length;

  if (failed === marks.length) return 'FAIL';
  if (failed > 0) return 'ATKT';
  return 'PASS';
}
getSubjectStatus(value: any): string {
  const mark = Number(value);
  return mark >= 35 ? 'Pass' : 'Fail';
}

isPass(value: any): boolean {
  return Number(value) >= 35;
}
onImgError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'icons/blank-avatar-profile-icon.jpg';
}
getGrade(percentage: number | null | undefined): string {

  if (percentage == null) return 'Not Available';

  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';

  return 'F';
}
}