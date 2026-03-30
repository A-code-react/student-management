import { StudentService } from './../../services/student.service';
import { PopupService } from './../../services/popup.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DashboardFilterService } from '../../services/dashboard-filter.service';
import db from '../../../../db.json'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-list-student',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list-student.component.html',
  styleUrl: './list-student.component.css',
})
export class ListStudentComponent implements OnInit {
  students: any[] = [];
  topStudents: any[] = [];
  filteredStudents: any[] = [];
  selectedStudentId: string | null = null;
  selectedDepartments: string[] = [];
  sortField: string = '';
  searchText: string = '';
  rankMap: any = {};
  states: any[] = []; // hold state/district data for lookups
  statusFilter: string = '';
  sortDirection: any = {
    name: 'asc',
    age: 'asc',
    percentage: 'asc',
  };
  currentPage: number = 1;
  itemsPerPage: number = 25;
  totalPages: number = 0;
  paginatedStudents: any[] = []; 
  initialDepartment: string | null = null;

  // Loader flags
  isLoadingStudents = false;
  isLoadingStates = false;
  isDeleting = false;
  isExporting = false;

  constructor(
    private StudentService: StudentService,
    private dashboardFilter: DashboardFilterService,
    private route: ActivatedRoute, 
    private router: Router,
    private popupService: PopupService
  ) {}

  ngOnInit() { 
    this.loadStates();
    this.route.queryParams.subscribe((params: any) => {
      this.initialDepartment = params['department'] || null;
      this.statusFilter = params['status'] || '';
      this.searchText = params['search'] || '';
    });
    this.loadStudents(); 
    this.dashboardFilter.departmentFilter$.subscribe(dept => {
      if (dept) {
        this.selectedDepartments = [dept];
        this.applyFilters();
      }
    });
  }

  loadStates() {
    this.isLoadingStates = true;
    try {
      this.states = db.states; // your states array file
      this.isLoadingStates = false;
    } catch (error) {
      console.error('Error loading states:', error);
      this.isLoadingStates = false;
      this.popupService.show('Failed to load states data', 'error');
    }
  }

  loadStudents() {
    this.isLoadingStudents = true;
    this.StudentService.getStudents().subscribe({
      next: (data: any) => {
        //sort by % (highest first)
        this.students = data;
        const ranked = [...data].sort(
          (a: any, b: any) => b.percentage - a.percentage,
        );
        ranked.forEach((student: any, index: number) => {
          this.rankMap[student._id] = index + 1;  
        });
        this.students = ranked;
        this.filteredStudents = [...ranked];
        this.updatePagination();
        
        if (this.initialDepartment) {
          this.selectedDepartments = [this.initialDepartment];
        }
        this.applyFilters();
        this.isLoadingStudents = false;
        this.popupService.show('Students loaded successfully', 'success');
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.isLoadingStudents = false;
        this.popupService.show('Failed to load students. Please try again.', 'error');
      }
    });
  }

  filterDepartment() {
    this.applyFilters();
  }

  sortStudents(field: string) {
    this.sortField = field;
    this.sortDirection[field] =
      this.sortDirection[field] === 'asc' ? 'desc' : 'asc';

    const direction = this.sortDirection[field];

    this.filteredStudents.sort((a: any, b: any) => {
      let result = 0;

      if (field === 'name') {
        result = a.name.localeCompare(b.name);
      }
      else if (field === 'age') {
        result = this.getAgeInDays(a.age) - this.getAgeInDays(b.age);
      }
      else if (field === 'percentage') {
        result = a.percentage - b.percentage;
      }

      return direction === 'asc' ? result : -result;
    });

    this.updatePagination();
  }

  getAgeInDays(age: string): number {
    if (!age) return 0;
    const match = age.match(/(\d+)Y\s*(\d+)M\s*(\d+)D/);
    if (!match) return 0;
    const years = Number(match[1]);
    const months = Number(match[2]);
    const days = Number(match[3]);
    return (years * 365) + (months * 30) + days;
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '⬍'; // not active
    }
    return this.sortDirection[field] === 'asc' ? '⬆' : '⬇';
  }

  getMedal(student: any) {
    const rank = this.rankMap[student._id];
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }

  getMedalClass(student: any) {
    const rank = this.rankMap[student._id];
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  }

  toggleDetails(student: any) {
    if (this.selectedStudentId === student._id) {
      this.selectedStudentId = null; // close if clicked again
    } else {
      this.selectedStudentId = student._id;
    }
  }

  getSubjectKeys(student: any): string[] {
    return student.subjects ? Object.keys(student.subjects) : [];
  }

  getProgressBarClass(score: number): string {
    if (score >= 90) return 'bg-success';
    if (score >= 75) return 'bg-info';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
  }

  applyFilters() {
    let data = [...this.students];

    if (this.selectedDepartments.length) {
      data = data.filter((student) =>
        this.selectedDepartments.includes(student.department),
      );
    }

    if (this.searchText) {
      const text = this.searchText.toLowerCase();
      data = data.filter((student) =>
        student.name?.toLowerCase().includes(text),
      );
    }
    if (this.statusFilter) {
      data = data.filter(
        (student) => this.getStudentStatus(student) === this.statusFilter,
      );
    }
    this.filteredStudents = data;
    this.currentPage = 1; // reset to first page on filter
    this.updatePagination();
  }

  deleteStudent(id: string) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.isDeleting = true;
      this.StudentService.deleteStudent(id).subscribe({
        next: () => {
          this.isDeleting = false;
          this.popupService.show('Student deleted successfully', 'success');
          this.loadStudents(); // Reload students after deletion
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          this.isDeleting = false;
          this.popupService.show('Failed to delete student. Please try again.', 'error');
        }
      });
    }
  }

  getStateName(stateId: any) {
    const state = this.states.find((s: any) => s.id == stateId);
    return state ? state.name : '';
  }

  getDistrictName(stateId: any, districtId: any) {
    const state = this.states.find((s: any) => s.id == stateId);
    const district = state?.districts.find((d: any) => d.id == districtId);
    return district ? district.name : '';
  }

  getAddress(student: any) {
    if (!student.stateId || !student.districtId) {
      return '❗ Please update address';
    }
    const state = this.getStateName(student.stateId);
    const district = this.getDistrictName(student.stateId, student.districtId);
    return `${district}, ${state}`;
  }

  onDepartmentChange(event: any) {
    const value = event.target.value;

    if (event.target.checked) {
      this.selectedDepartments.push(value);
    } else {
      this.selectedDepartments = this.selectedDepartments.filter(
        d => d !== value
      );
    }

    this.applyFilters();
    this.updateQueryParams();
  }

  getStudentStatus(student: any): string {
    if (!student.subjects) return '';
    const marks = Object.values(student.subjects) as number[];
    const failedSubjects = marks.filter(m => m < 35).length;

    if (failedSubjects === marks.length) {
      return 'FAIL';        // failed in all subjects
    }
    if (failedSubjects > 0) {
      return 'ATKT';        // failed in some subjects
    }
    return 'PASS';
  }

  getGrade(percentage: number) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  isATKT(student: any): boolean {
    if (!student.subjects) return false;
    const marks = Object.values(student.subjects);
    return marks.some((mark: any) => mark < 35);
  }

  exportToExcel() {
    if (this.filteredStudents.length === 0) {
      this.popupService.show('No data to export', 'info');
      return;
    }

    this.isExporting = true;
    
    try {
      const exportData = this.filteredStudents.map((student: any) => ({
        Name: student.name,
        Age: student.age,
        Department: student.department,
        Percentage: student.percentage,
        Grade: this.getGrade(student.percentage),
        Status: this.getStudentStatus(student),
        Address: this.getAddress(student)
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { Students: worksheet }, SheetNames: ['Students'] };

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      const blob = new Blob([excelBuffer], {
        type: 'application/octet-stream'
      });

      saveAs(blob, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
      this.popupService.show('Export completed successfully', 'success');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.popupService.show('Failed to export data', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  getStudentPhoto(student: any) {
    if (student.photo) return student.photo;
    if (student.gender === 'Female 👩') {
      return 'icons/female-avatar-profile-icon.jpg';
    }
    if (student.gender === 'Male 👨') {
      return 'icons/male-avatar-profile-icon.jpg';
    }
    return 'icons/blank-avatar-profile-icon.jpg';
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getPages(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((x, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  changePageSize(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.updatePagination();
  }

  getStartRecord() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndRecord() {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredStudents.length
      ? this.filteredStudents.length
      : end;
  }

  updateQueryParams() {
    this.router.navigate([], {
      queryParams: {
        department: this.selectedDepartments.length 
          ? this.selectedDepartments.join(',') 
          : null,
        status: this.statusFilter || null,
        search: this.searchText || null
      },
      queryParamsHandling: 'merge'
    });
  }

  removeDepartment(dept: string) {
    this.selectedDepartments = this.selectedDepartments.filter(
      d => d !== dept
    );
    this.applyFilters();
    this.updateQueryParams();
  }

  clearStatus() {
    this.statusFilter = '';
    this.applyFilters();
    this.updateQueryParams();
  }

  clearAllFilters() {
    this.selectedDepartments = [];
    this.statusFilter = '';
    this.searchText = '';
    this.applyFilters();
    this.updateQueryParams();
    this.popupService.show('All filters cleared', 'info');
  }

  retryLoad() {
    this.loadStudents();
  }
}