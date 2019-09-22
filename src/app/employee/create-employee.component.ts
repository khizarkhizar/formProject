import { Component, OnInit } from '@angular/core';
// Import FormGroup and FormControl classes
import { FormGroup,FormBuilder,Validators, AbstractControl, FormArray, FormControl, ValidationErrors } from '@angular/forms';
import { Variable } from '@angular/compiler/src/render3/r3_ast';
import { FormattedError } from '@angular/compiler';
import {Router, ActivatedRoute} from '@angular/router';
import{EmployeeService}from './employee.service';
import {ISkill}from './ISkill';
import {IEmployee} from './IEmployee';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  fullNameLength=0;
  pageTitle: string;
employee:IEmployee;
  constructor(private fb: FormBuilder,    private route:ActivatedRoute,
    private employeeService:EmployeeService, private router :Router) { }
 
  ngOnInit() {
    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      emailGroup: this.fb.group({
      email: ['', [Validators.required,emailDomain('pragimtech.com')]],
     confirmEmail:['',Validators.required],},{validators:matchEmails}),
      skills: this.fb.array([
      this.addSkillFormGroup()
    ]),
    });
   
    // When any of the form control value in employee form changes
    // our validation function logValidationErrors() is called
    this.employeeForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.employeeForm);
    }); 
    this.route.paramMap.subscribe(params=>{
      const empId=+params.get('id');
      if(empId){    this.pageTitle = 'Edit Employee';
        this.getEmployee(empId);
      }else {    this.pageTitle = 'Create Employee';
        this.employee = {
          id: null,
          fullName: '',
          contactPreference: '',
          email: '',
          phone: null,
          skills: []
        };}
    });
   
  }
  getEmployee(id:number)
  {
    this.employeeService.getEmployee(id).subscribe(
      (employee:IEmployee)=>{
        this.employee = employee;
        this.editEmployee(employee);
      },
      (err:any)=>console.log(err));
    
  }     
  editEmployee(employee:IEmployee){
    this.employeeForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });
    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
  }
  setExistingSkills(skillSets: ISkill[]): FormArray {
    const formArray = new FormArray([]);
    skillSets.forEach(s => {
      formArray.push(this.fb.group({
        skillName: s.skillName,
        experienceInYears: s.experienceInYears,
        proficiency: s.proficiency
      }));
    });
  
    return formArray;
  }
  
  addSkillButtonClick(): void {
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillFormGroup());
  }
  removeSkillButtonClick(skillGroupIndex: number): void {
    const skillsFormArray = <FormArray>this.employeeForm.get('skills');
    skillsFormArray.removeAt(skillGroupIndex);
    skillsFormArray.markAsDirty();
    skillsFormArray.markAsTouched();
  }
  addSkillFormGroup(): FormGroup {
    return this.fb.group({
      skillName: ['', Validators.required],
      experienceInYears: ['', Validators.required],
      proficiency: ['', Validators.required]
    });
  }
  formErrors= {
    'fullName': '',
    'email': '',
    'confirmEmail': '',
    'emailGroup': '',
    'skillName': '',
    'experienceInYears': '',
    'proficiency': ''
  };
  validationMessages = {
    'fullName': {
      'required': 'Full Name is required.',
      'minlength': 'Full Name must be greater than 2 characters.',
      'maxlength': 'Full Name must be less than 2 characters.',
    },
    'email': {
      'required': 'Email is required.',
      'emailDomain': 'Email domian should be pragimtech.com'
    },
    'confirmEmail': {
      'required': 'Confirm Email is required.'
    },
    'emailGroup': {
      'emailMismatch': 'Email and Confirm Email do not match.'
    },
    'skillName': {
      'required': 'Skill Name is required.',
    },
    'experienceInYears': {
      'required': 'Experience is required.',
    },
    'proficiency': {
      'required': 'Proficiency is required.',
    },
  }; 

  logValidationErrors(group: FormGroup = this.employeeForm): void {
  Object.keys(group.controls).forEach((key: string) => {
    const abstractControl = group.get(key);
    this.formErrors[key] = '';
    // Loop through nested form groups and form controls to check
    // for validation errors. For the form groups and form controls
    // that have failed validation, retrieve the corresponding
    // validation message from validationMessages object and store
    // it in the formErrors object. The UI binds to the formErrors
    // object properties to display the validation errors.
    if (abstractControl && !abstractControl.valid
      && (abstractControl.touched || abstractControl.dirty)) {
      const messages = this.validationMessages[key];
      for (const errorKey in abstractControl.errors) {
        if (errorKey) {
          this.formErrors[key] += messages[errorKey] + ' ';
        }
      }
    }

    if (abstractControl instanceof FormGroup) {
      this.logValidationErrors(abstractControl);
    }
        // logValidationErrors() method to fix the broken validation
        if (abstractControl instanceof FormArray) {
          for (const control of abstractControl.controls) {
            if (control instanceof FormGroup) {
              this.logValidationErrors(control);
            }
          }
        }
  });
}

onSubmit(): void {
  this.mapFormValuesToEmployeeModel();
  if (this.employee.id) {
  this.employeeService.updateEmployee(this.employee).subscribe(
    () => this.router.navigate(['list']),
    (err: any) => console.log(err)
  );
   
} else {
  this.employeeService.addEmployee(this.employee).subscribe(
    () => this.router.navigate(['list']),
    (err: any) => console.log(err)
  );
}
}
mapFormValuesToEmployeeModel() {
  this.employee.fullName = this.employeeForm.value.fullName;
  this.employee.contactPreference = this.employeeForm.value.contactPreference;
  this.employee.email = this.employeeForm.value.emailGroup.email;
  this.employee.phone = this.employeeForm.value.phone;
  this.employee.skills = this.employeeForm.value.skills;
}
onLoadDataClick(): void {
  this.logKeyValuePairs(this.employeeForm); 

  const formArray = new FormArray([
    new FormControl('John', Validators.required),
    new FormGroup({
      country: new FormControl('', Validators.required)
    }),
    new FormArray([])
  ]);
  const formArray1 = this.fb.array([
    new FormControl('John', Validators.required),
    new FormControl('IT', Validators.required),
    new FormControl('', Validators.required),
  ]);
  const formGroup = this.fb.group([
    new FormControl('John', Validators.required),
    new FormControl('IT', Validators.required),
    new FormControl('', Validators.required),
  ]);
  for (const control of formArray.controls) {
    if (control instanceof FormControl) {
      console.log('control is FormControl');
    }
    if (control instanceof FormGroup) {
      console.log('control is FormGroup');
    }
    if (control instanceof FormArray) {
      console.log('control is FormArray');
    }
  }
  console.log(formArray.value); 
  console.log(formGroup.value);
 }
  
   logKeyValuePairs(group: FormGroup): void {
     // loop through each key in the FormGroup
     Object.keys(group.controls).forEach((key: string) => {
       // Get a reference to the control using the FormGroup.get() method
       const abstractControl = group.get(key);
       // If the control is an instance of FormGroup i.e a nested FormGroup
       // then recursively call this same method (logKeyValuePairs) passing it
       // the FormGroup so we can get to the form controls in it
       if (abstractControl instanceof FormGroup) {
         this.logKeyValuePairs(abstractControl);
         // If the control is not a FormGroup then we know it's a FormControl
       } else {
         console.log('Key = ' + key + ' && Value = ' + abstractControl.value);
       }
     });
   }
   
  } 
  function emailDomain(domainName: string) {
    return (control: AbstractControl): { [key: string]: any } | null => {
    const email: string = control.value;
    const domain = email.substring(email.lastIndexOf('@') + 1);
    if (email === '' ||  domain.toLowerCase() === domainName.toLowerCase()) {
      return null;
    } else {
      return { 'emailDomain': true };
    }
  }}
  function matchEmails(group: AbstractControl): { [key: string]: any } | null {
    const emailControl = group.get('email');
    const confirmEmailControl = group.get('confirmEmail');
  
    if (emailControl.value === confirmEmailControl.value || confirmEmailControl.pristine && confirmEmailControl.value === '') {
      return null;
    } else {
      return { 'emailMismatch': true };
    }
  }
 
