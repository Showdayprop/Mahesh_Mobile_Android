import { NgModule } from '@angular/core';
import {
  MatTableModule,
  MatStepperModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatOptionModule,
  MatSelectModule,
  MatIconModule,
  MatPaginatorModule,
  MatSortModule,
  MatAutocompleteModule,
  MatChipsModule,
  MatDialogModule,
  MatSlideToggleModule,
  MatExpansionModule
} from '@angular/material';

@NgModule({
  exports: [
    MatTableModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatExpansionModule
  ]
})
export class MaterialModule {}
