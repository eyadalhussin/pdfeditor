import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { PdfEditorComponent } from './pdf-editor/pdf-editor.component';
import { PdfLoadingSpinnerComponent } from './pdf-loading-spinner/pdf-loading-spinner.component';
import { FileCompComponent } from './file-comp/file-comp.component';
import { RouterModule, Routes } from '@angular/router';

const appRoutes:Routes = [
  {path:'', component: PdfEditorComponent},
  {path:'**', redirectTo:'/', pathMatch:'full'},
]

@NgModule({
  declarations: [
    AppComponent,
    PdfEditorComponent,
    PdfLoadingSpinnerComponent,
    FileCompComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
