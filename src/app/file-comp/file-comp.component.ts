import { Component, Input, OnInit } from '@angular/core';
import { authService } from '../auth.service';

@Component({
  selector: 'app-file-comp',
  templateUrl: './file-comp.component.html',
  styleUrls: ['./file-comp.component.css']
})
export class FileCompComponent implements OnInit {

  @Input('fileID') fileID:string;
  @Input('imgSource') imgSource:string;
  @Input('fileName') fileName:string;
  
  constructor(private authService:authService) { }

  ngOnInit(): void {
  }

  removeFile(){
    this.authService.removeFile(this.fileID);
  }

}
