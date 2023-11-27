import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Subject, throwError } from "rxjs";
import { serverFile } from "./serverFile.module";

@Injectable({ providedIn: 'root' })
export class authService {
    isLoading = new Subject<boolean>();
    processDisabled = new Subject<boolean>();
    downloadDisabled = new Subject<boolean>();
    status = new Subject<string>();
    authStatus = new Subject<string>();
    authorized:boolean = false;
    //Authentication
    // Key: string = 'project_public_5d08fa4297655a8051817c2958cc80e6_Di3zNb6d429201c7c26b6d6c1f65169777565';
    Key: string;
    errorMessage: string = null;
    authResponse;

    //Get Server Data
    serverResponse;
    serverName: string;
    taskName: string;
    remainingFiles = new Subject<number>();
    headers: HttpHeaders;
    token: string = 'Bearer ';
    fileName: string = '';

    //Files
    fileList: File[] = [];
    fileListServerName: serverFile[] = [];

    //FileUpload
    fileUploadRes;
    serverFileName: string;
    selectedTool: string = 'imagepdf';
    downloadBlob: Blob;
    httpOptions;
    downloadLink;
    downloadFile;

    constructor(private http: HttpClient) {
        this.httpOptions = {
            responseType: 'blob' as 'json'
        };
        this.downloadDisabled.next(true);
        this.processDisabled.next(true);
    }

    auth() {
        return this.http.post('https://api.ilovepdf.com/v1/auth', { public_key: this.Key });
    }

    start() {
        let keyInput = document.querySelector('#keyInput') as HTMLInputElement;
        this.Key = keyInput.value;
        keyInput.value = '';
        this.isLoading.next(true);
        this.downloadDisabled.next(true);
        this.status.next('Connecting to Server');
        // console.log("Starting start");
        this.processDisabled.next(true);
        //Try To Authorize
        // console.log("Trying to Authorize");
        const authorization = this.auth();
        let authResData;
        authorization.subscribe({
            next: resData => {
                this.authStatus.next('Connecting ...');
                authResData = resData;
                //Save The Token
                this.token += authResData.token;
                this.headers = new HttpHeaders({
                    'Authorization': this.token
                });
                //Retrieve Process Button
                console.log("Token Name:" + this.token);
                this.isLoading.next(false);
                this.authStatus.next('Authorized!');
                this.authorized = true;
            },
            error: error => {
                console.log(error);
                this.authStatus.next('Error!');
            }
        });
    }

    //start/tool
    //Accepted Values : merge , split, compress, ....
    getServer() {
        this.isLoading.next(true);
        this.status.next('Getting Server Information...')
        let serverData;
        const serverInfo = this.http.get(`https://api.ilovepdf.com/v1/start/${this.selectedTool}`, { headers: this.headers });
        serverInfo.subscribe({
            next: res => {
                serverData = res;
                this.serverName = serverData.server;
                this.taskName = serverData.task;
                console.log("Server Name:" + this.serverName);
                console.log("Server Name:" + this.taskName);
                //3rd Step, Upload Files to the server
                this.upload();
                setTimeout(() => {
                    this.process();
                }, 2000);
            },
            error: error => {
                console.log(error);
            }
        });
    }

    upload() {
        this.status.next('Uploading Files');
        const requests = this.fileList.forEach(file => {
            let data;
            let serverFileName;
            //Uploading files must be within FormData
            const formData = new FormData();
            formData.append("file", file);
            formData.append("task", this.taskName);
            const uploadFile = this.http.post(`https://${this.serverName}/v1/upload`, formData, { headers: this.headers });
            uploadFile.subscribe({
                next: res => {
                    data = res;
                    serverFileName = data.server_filename;
                    console.log(res);
                    this.fileListServerName.push(new serverFile(serverFileName, file.name));
                }
            })
        });
    }

    process() {
        this.status.next('ProcessingFiles...');
        const proc = this.http.post(`https://${this.serverName}/v1/process`,
            { task: this.taskName, tool: this.selectedTool, files: this.fileListServerName },
            { headers: this.headers });
        proc.subscribe({
            next: res => {
                console.log(res);
                //Download Part
                this.isLoading.next(true);
                let downloadRes;
                const down = this.http.get(`https://${this.serverName}/v1/download/${this.taskName}`, { headers: this.headers, responseType: 'blob' });
                down.subscribe({
                    next: downloadResponse => {
                        downloadRes = downloadResponse;
                        this.downloadBlob = new Blob([downloadRes], { type: 'application/pdf' });
                        var downloadURL = window.URL.createObjectURL(this.downloadBlob);
                        this.downloadLink = document.getElementById('downloadFile') as HTMLAnchorElement;
                        this.downloadLink.href = downloadURL;
                        this.isLoading.next(false);
                    },
                    error: error => {
                        console.log(error.message);
                        this.isLoading.next(false);
                    }
                })
                //Download Part
                this.status.next('');
                this.isLoading.next(false);
                this.downloadDisabled.next(false);
                //Preparing the Download
            },
            error: error => {
                this.status.next(error.message);
                this.isLoading.next(false);
                this.processDisabled.next(true);
                this.downloadDisabled.next(true);
            }
        });
    }

    download() {
        let file = document.getElementById('downloadFile') as HTMLAnchorElement;
        // file.click();
    }

    addFile(event: Event) {
        // (<HTMLInputElement>event.target).files[0];
        const files = (<HTMLInputElement>event.target).files;
        let i = 0;

        while (i < files.length) {
            this.fileList.push(files[i]);
            i++;
        }
        console.log(this.fileList);
        if(this.authorized) this.processDisabled.next(false);
    }

    removeFile(fileID: string) {
        this.fileList.splice(+fileID, 1);
        console.log(this.fileList.length);
        if (this.fileList.length <= 0) this.processDisabled.next(true);
    }

    setTool(tool: string) {
        this.selectedTool = tool;
        let inputFeld;
        inputFeld = document.querySelector('#inputFeld');

        switch (tool) {
            //Image To Pdf 
            case 'imagepdf':
                inputFeld.setAttribute('accept', 'image/*');
                inputFeld.removeAttribute('multiple');
                break;
            //Pdf To Jpg
            case 'pdfjpg':
                inputFeld.setAttribute('accept', '.pdf');
                inputFeld.removeAttribute('multiple');
                break;
            //Compress
            case 'compress':
                inputFeld.setAttribute('accept', '.pdf');
                inputFeld.removeAttribute('multiple', '');
                break;
            //Merge
            case 'merge':
                inputFeld.setAttribute('accept', '.pdf');
                inputFeld.setAttribute('multiple', '');
                break;
        }
    }
}