import { StudentService } from './../../services/student.service';
import { PopupService } from '../../services/popup.service';

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
  states: any[] = [];
  districts: any[] = [];
  genders: string[] = [];
  studentPhoto: string = "";
  selectedFile!: File;
  imagePreview: string | ArrayBuffer | null = null;
  allowed_formats: string[] = ["jpg", "png", "jpeg"];
  activitiesList: string[] = [
    'Sports',
    'Music',
    'Dance',
    'Drama',
    'Debate',
    'Art',
    'NCC',
    'NSS',
  ];
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

  // Loader flags
  isLoadingStates = false;
  isLoadingDistricts = false;
  isLoadingStudent = false;
  isSubmitting = false;

  // Helper method to normalize gender with emoji
  normalizeGenderWithEmoji(gender: string): string {
    if (!gender) return '';
    const cleanGender = gender.replace(/[👨👩]/g, '').trim();
    if (cleanGender.toLowerCase() === 'male') return 'Male 👨';
    if (cleanGender.toLowerCase() === 'female') return 'Female 👩';
    return gender;
  }

  // Helper method to remove emoji from gender before sending to backend
  genderWithoutEmoji(gender: string): string {
    if (!gender) return '';
    return gender.replace(/[👨👩]/g, '').trim();
  }

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService,
  ) {
    this.studentForm = this.fb.group({
      name: ['', Validators.required],
      dob: ['', Validators.required],
      department: ['', Validators.required],
      gender: ['', Validators.required],
      stateId: ['', Validators.required],
      districtId: ['', Validators.required],
      activities: [[]], // multi select array
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

    if (this.studentId) {
      this.isEditMode = true;
    }

    this.loadStates();

    this.studentForm.get('stateId')?.valueChanges.subscribe((stateId) => {
      // load districts for selected state
      if (stateId) {
        this.loadDistricts(stateId);
        // reset district when state changes
        this.studentForm.get('districtId')?.reset();
      } else {
        this.districts = [];
      }
    });
  }

  calculateMarks() {
    const subjects = this.studentForm.get('subjects')?.value;

    if (!subjects) return;

    const marks = Object.values(subjects) as number[];

    this.totalMarks = marks.reduce((sum, m) => sum + Number(m), 0);

    this.percentage = Number(
      ((this.totalMarks / (marks.length * 100)) * 100).toFixed(2)
    );
  }

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

    // AGE VALIDATION
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

  loadStates() {
    this.isLoadingStates = true;
    this.studentService.getStates().subscribe({
      next: (res: any) => {
        this.states = res;
        this.isLoadingStates = false;

        // If edit mode, load districts after states arrive
        if (this.isEditMode && this.studentId) {
          this.loadStudent(this.studentId);
        }
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.isLoadingStates = false;
        this.popupService.show('Failed to load states', 'error');
      }
    });
  }

  loadStudent(id: string) {
    this.isLoadingStudent = true;
    this.studentService.getStudentById(id).subscribe({
      next: (student: any) => {
        this.studentForm.patchValue({
          name: student.name,
          dob: student.dob,
          department: student.department,
          gender: this.normalizeGenderWithEmoji(student.gender),
          stateId: Number(student.stateId),
          districtId: Number(student.districtId),
          activities: student.activities
        });

        this.loadSubjects(student.department);

        setTimeout(() => {
          this.studentForm.get('subjects')?.patchValue(student.subjects);
        }, 400);

        this.loadDistricts(student.stateId);

        // ✅ Store existing photo
        this.studentPhoto = student.photo || '';
        
        // ✅ Set image preview if photo exists
        if (this.studentPhoto) {
          // Check if it's a full URL or just a filename
          if (this.studentPhoto.startsWith('http')) {
            this.imagePreview = this.studentPhoto;
          } else if (this.studentPhoto.startsWith('data:')) {
            // If it's base64 string
            this.imagePreview = this.studentPhoto;
          } else {
            // Assuming your backend serves images from a specific endpoint
            this.imagePreview = `https://student-backend-0mnt.onrender.com/uploads/${this.studentPhoto}`;
          }
        } else {
          this.imagePreview = null;
        }
        
        this.isLoadingStudent = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.isLoadingStudent = false;
        this.popupService.show('Failed to load student data', 'error');
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      // Get file extension and convert to lowercase
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      // Check if file format is allowed
      if (!fileExtension || !this.allowed_formats.includes(fileExtension)) {
        this.popupService.show(
          `Invalid file format. Allowed formats: ${this.allowed_formats.join(', ').toUpperCase()}`,
          'error'
        );
        event.target.value = ''; // Clear the file input
        this.selectedFile = null as any;
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };

      reader.readAsDataURL(file);
    } else {
      // If file selection is cleared, keep the existing photo
      if (this.isEditMode && this.studentPhoto) {
        if (this.studentPhoto.startsWith('http')) {
          this.imagePreview = this.studentPhoto;
        } else if (this.studentPhoto.startsWith('data:')) {
          this.imagePreview = this.studentPhoto;
        } else {
          this.imagePreview = `https://student-backend-0mnt.onrender.com/uploads/${this.studentPhoto}`;
        }
      } else {
        this.imagePreview = null;
      }
    }
  }

  removeSelectedPhoto() {
    this.selectedFile = null as any;
    if (this.isEditMode && this.studentPhoto) {
      // Restore existing photo preview
      if (this.studentPhoto.startsWith('http')) {
        this.imagePreview = this.studentPhoto;
      } else if (this.studentPhoto.startsWith('data:')) {
        this.imagePreview = this.studentPhoto;
      } else {
        this.imagePreview = `https://student-backend-0mnt.onrender.com/uploads/${this.studentPhoto}`;
      }
    } else {
      this.imagePreview = null;
    }
  }

  removeExistingPhoto() {
    this.studentPhoto = '';
    this.imagePreview = null;
    this.selectedFile = null as any;
    this.popupService.show('Existing photo will be removed on update', 'info');
  }

  addStudent() {
    if (this.studentForm.invalid || this.ageError) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    formData.append("name", this.studentForm.value.name);
    formData.append("dob", this.studentForm.value.dob);
    formData.append("department", this.studentForm.value.department);
    formData.append("gender", this.genderWithoutEmoji(this.studentForm.value.gender));
    formData.append("stateId", this.studentForm.value.stateId);
    formData.append("districtId", this.studentForm.value.districtId);

    formData.append(
      "activities",
      JSON.stringify(this.studentForm.value.activities)
    );
    formData.append(
      "subjects",
      JSON.stringify(this.studentForm.value.subjects)
    );

    formData.append(
      "age",
      `${this.ageYears}Y ${this.ageMonths}M ${this.ageDays}D`
    );
    formData.append("totalMarks", this.totalMarks.toString());
    formData.append("percentage", this.percentage.toString());

    // ✅ Enhanced IMAGE HANDLING
    if (this.selectedFile) {
      // New image selected
      formData.append("photo", this.selectedFile);
    } else if (this.isEditMode && this.studentPhoto) {
      // Keep existing image
      formData.append("photo", this.studentPhoto);
    } else if (this.isEditMode && !this.studentPhoto && this.imagePreview === null) {
      // Photo was removed
      formData.append("removePhoto", "true");
    }

    if (this.isEditMode) {
      this.studentService.updateStudent(this.studentId!, formData)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.popupService.show('Student updated successfully', 'success');
            this.router.navigate(['/list-student']);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error updating student:', error);
            this.popupService.show('Failed to update student', 'error');
          }
        });
    } else {
      this.studentService.addStudent(formData)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.popupService.show('Student added successfully', 'success');
            this.router.navigate(['/list-student']);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error adding student:', error);
            this.popupService.show('Failed to add student', 'error');
          }
        });
    }
  }

  loadDistricts(stateId: any) {
    this.isLoadingDistricts = true;
    const selectedState = this.states.find((state) => state.id == stateId);
    
    // Simulate loading delay or actual API call
    setTimeout(() => {
      this.districts = selectedState ? selectedState.districts : [];
      this.isLoadingDistricts = false;
    }, 300);
  }

  onActivityChange(event: any) {
    const selectedActivities = this.studentForm.value.activities || [];

    if (event.target.checked) {
      selectedActivities.push(event.target.value);
    } else {
      const index = selectedActivities.indexOf(event.target.value);
      if (index > -1) {
        selectedActivities.splice(index, 1);
      }
    }

    this.studentForm.patchValue({
      activities: selectedActivities,
    });
  }
}