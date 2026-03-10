import { StudentService } from './../../services/student.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-list-student',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list-student.component.html',
  styleUrl: './list-student.component.css'
})
export class ListStudentComponent implements OnInit {

  students:any[] = [];
  topStudents:any[] = [];
  filteredStudents:any[] = [];
  selectedStudentId:string | null = null;
  selectedDepartment:string = '';
  sortField:string = '';
  searchText:string = '';
  rankMap:any = {};
  sortDirection: any = {
  name: 'asc',
  age: 'asc',
  percentage: 'asc'
};

  constructor(private StudentService: StudentService){}

  ngOnInit(){
    this.loadStudents();
  }

  loadStudents(){
    this.StudentService.getStudents().subscribe((data:any)=>{
      //sort by % (highest first)
      this.students = data;
      const ranked = [...data].sort( 
        (a:any,b:any)=> b.percentage - a.percentage
       )
       ranked.forEach((student:any, index:number) => {
        this.rankMap[student.id] = index + 1; // store rank by student ID
       });
       this.students = ranked
      this.filteredStudents = [...ranked];
       
    });
  }
 

filterDepartment(){
  this.applyFilters();
}

sortStudents(field:string){
  this.sortDirection[field] = this.sortDirection[field] === 'asc' ? 'desc' : 'asc';
  const direction = this.sortDirection[field]  
  this.filteredStudents.sort((a:any, b:any) => {
    let result = 0;
    
    if(field === 'name'){
      result = a.name.localeCompare(b.name);
    }
    if(field === 'age'){
      result = a.age.localeCompare(b.age)
    }
    if(field === 'percentage'){
      result = b.percentage - a.percentage;
    }
    return direction === 'asc' ? result : -result;
  });
}

getMedal(student: any)  {
  const rank = this.rankMap[student.id];
   if(rank === 1) return "🥇"; 
   if(rank === 2) return "🥈"; 
   if(rank === 3) return "🥉";
    return "";
}
getMedalClass(student:any){ 
  const rank = this.rankMap[student.id];
  if(rank === 1) return "gold"; 
  if(rank === 2) return "silver"; 
  if(rank === 3) return "bronze"; 
  return ""; 
}
toggleDetails(student:any){
   if(this.selectedStudentId === student.id)
    { this.selectedStudentId = null; // close if clicked again 
    }else{
       this.selectedStudentId = student.id; 
      } 
      }

applyFilters(){
  let data = [...this.students];
  if(this.selectedDepartment){
    data = data.filter(student => student.department === this.selectedDepartment);
  }
  if(this.searchText){
    const text = this.searchText.toLowerCase();
    data = data.filter(student => student.name.toLowerCase().includes(text));
  }
  this.filteredStudents = data;
}
deleteStudent(id:string){

if(confirm("Are you sure you want to delete this student?")){

this.StudentService.deleteStudent(id).subscribe(()=>{

this.loadStudents();

});

}

}

}