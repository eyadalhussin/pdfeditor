import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { authService } from '../auth.service';

@Component({
  selector: 'app-pdf-editor',
  templateUrl: './pdf-editor.component.html',
  styleUrls: ['./pdf-editor.component.css']
})
export class PdfEditorComponent implements OnInit {
  activeToken: string;
  isLoading:boolean = false;
  error: string = null;
  processDisabled:boolean = true;
  downloadDisabled:boolean = true;
  selectedTool:string = 'imagepdf';
  authStatus: string = 'Not Authorized!';

  serverName:string;
  taskName:string;
  remainingFiles:number;

  fileName:string = '';
  fileList = [];

  status:string;


  constructor(private authService: authService) { }

  ngOnInit(): void {
    this.authService.status.subscribe(erg => this.status = erg);
    this.authService.isLoading.subscribe(erg => this.isLoading = erg);
    this.authService.downloadDisabled.subscribe(erg => this.downloadDisabled = erg);
    this.authService.remainingFiles.subscribe(remainingFiles => this.remainingFiles = remainingFiles);
    this.authService.processDisabled.subscribe(erg => this.processDisabled = erg);
    this.authService.authStatus.subscribe(erg => this.authStatus = erg);
    this.authService.setTool('imagepdf');
    // this.authService.start();
  }

  onSubmit(form: NgForm) {
    console.log(form.value);
  }

  authenticate() {
    // this.authService.auth().subscribe(
    //   resData => {
    //     this.authResponse = resData;
    //   },
    //   errorResponse => {
    //     console.log(errorResponse.error.error.message);
    //   });
  }

  getServer() {
    // this.authService.getServer().subscribe(
    //   (resData) => {
    //     this.getResponse = resData;
    //     this.remainingFiles = this.getResponse.remaining_files;
    //     console.log(resData);
    //     console.log(this.getResponse.server);
    //     console.log(this.remainingFiles);
    //   },
    //   errorResponse => {
    //     this.error = errorResponse;
    //   });
  }

  start(){
    this.authService.start();
    this.serverName = this.authService.serverName;
  }

  uploadFiles(event:Event){
    // this.authService.uploadFiles(event);
  }

  addFile(event:Event, fileUpload:HTMLInputElement){
    if(this.selectedTool == 'imagepdf' || this.selectedTool == 'jpgpdf') this.clear();
    this.authService.addFile(event);
    this.fileList = this.authService.fileList;
    fileUpload.value = '';
  }

  process(){
    this.authService.getServer();
  }

  download(){
    this.authService.download();
  }

  clear(){
    this.authService.fileList = this.fileList = [];
    this.processDisabled = true;
    this.downloadDisabled = true;
  }

  resetForm(f:NgForm){
    f.reset();
  }

  setTool(tool:string){
    this.clear();
    this.authService.setTool(tool);
    this.selectedTool = tool;
  }

}
