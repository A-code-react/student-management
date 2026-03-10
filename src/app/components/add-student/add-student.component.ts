import { StudentService } from './../../services/student.service';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css'],
})
export class AddStudentComponent {
  studentForm!: FormGroup;

  ageYears = 0;
  ageMonths = 0;
  ageDays = 0;
  totalMarks = 0;
  percentage = 0;
  studentId: string | null = null;
  isEditMode = false;
  departments: any = {
    science: [
      'English',
      'Mother Tongue',
      'Physics',
      'Chemistry',
      'Mathematics',
      'Biology',
    ],
    commerce: [
      'English',
      'Mother Tongue',
      'Accountancy',
      'Business Studies',
      'Economics',
      'Mathematics',
    ],
    arts: [
      'English',
      'Mother Tongue',
      'History',
      'Political Science',
      'Geography',
      'Sociology',
    ],
  };
  ageError: string = '';
  subjects: string[] = [];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.studentForm = this.fb.group({
      name: ['', Validators.required],
      dob: ['', Validators.required],
      department: ['', Validators.required],
    });

    // Marks calculation
    this.studentForm.valueChanges.subscribe(() => {
      this.calculateMarks();
    });

    // Age calculation
    this.studentForm.get('dob')?.valueChanges.subscribe((dob) => {
      if (dob) {
        this.calculateAge(dob);
      }
    });
    this.studentForm.get('department')?.valueChanges.subscribe((dept) => {
      this.loadSubjects(dept);
    });
  }
ngOnInit() {

  this.studentId = this.route.snapshot.paramMap.get('id');

  if(this.studentId){
    this.isEditMode = true;
    this.loadStudent(this.studentId);
  }

}
  calculateMarks() {
    const subjects = this.studentForm.get('subjects')?.value;

    if (!subjects) return;

    const marks = Object.values(subjects) as number[];

    this.totalMarks = marks.reduce((sum, m) => sum + Number(m), 0);

    this.percentage = (this.totalMarks / (marks.length * 100)) * 100;
  }

  // addStudent stays defined later to use the service

  calculateAge(dob: string) {
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    this.ageYears = years;
    this.ageMonths = months;
    this.ageDays = days;

    // ✅ AGE VALIDATION
    if (years < 12) {
      this.ageError = 'Student age must be more than 12 years';
    } else if (years > 20) {
      this.ageError = 'Student age must be less than 20 years';
    } else {
      this.ageError = '';
    }
  }

  loadSubjects(dept: string) {
    if (!dept) return;

    this.subjects = this.departments[dept.toLowerCase()] || [];

    const subjectControls: any = {};

    this.subjects.forEach((subject) => {
      subjectControls[subject] = [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ];
    });

    // remove old subjects group if exists
    if (this.studentForm.contains('subjects')) {
      this.studentForm.removeControl('subjects');
    }

    this.studentForm.addControl('subjects', this.fb.group(subjectControls));
  }

  // addStudent() {
  //   const studentData = {
  //     ...this.studentForm.value,
  //     age: `${this.ageYears}Y ${this.ageMonths}M ${this.ageDays}D`,
  //     totalMarks: this.totalMarks,
  //     percentage: this.percentage,
  //   };

  //   this.studentService.addStudent(studentData).subscribe({
  //     next: (res) => {
  //       console.log('Student saved', res);
  //       alert('Student added successfully');
  //       this.studentForm.reset();
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     },
  //   });
  // }
addStudent(){

const studentData = {
  ...this.studentForm.value,
  age: `${this.ageYears}Y ${this.ageMonths}M ${this.ageDays}D`,
  totalMarks: this.totalMarks,
  percentage: this.percentage
};

if(this.isEditMode){

this.studentService.updateStudent(this.studentId!,studentData)
.subscribe(()=>{

alert("Student updated successfully");

this.router.navigate(['/list-student']);

});

}else{

this.studentService.addStudent(studentData)
.subscribe(()=>{

alert("Student added successfully");

this.router.navigate(['/list-student']);

});

}

}

  loadStudent(id:string){

this.studentService.getStudents().subscribe((data:any)=>{

const student = data.find((s:any)=> s.id === id);

if(student){

this.studentForm.patchValue({
  name: student.name,
  dob: student.dob,
  department: student.department
});

this.loadSubjects(student.department);

setTimeout(()=>{
  this.studentForm.get('subjects')?.patchValue(student.subjects);
},100);

}

});

}
}
