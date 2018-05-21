import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask, } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})

export class FileUploadComponent {

  
  //event for sending a string-hash to createWork.
  //triggered when the file upload is complete
  @Output() uploaded = new EventEmitter<{hash: string, downloadURL: Observable<string>}>();

  //main task
  task: AngularFireUploadTask;

  // Progress monitoring
  percentage: Observable<number>;

  snapshot: Observable<any>;

  // Download URL
  downloadURL: Observable<string>;

  // State for dropzone CSS toggling
  isHovering: boolean;

  //the firebase directive where to store the upload file
  pathPrefix: string;


  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private router: Router) {
    this.pathPrefix = this.getPathPrefix(router.url);
    }

  getPathPrefix(str: string): string {
    let i = str.substring(1).indexOf('/');
    if(i>0){
      return str.slice(0,i+1);
    }else 
      return str;
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  //the main upload function
  startUpload(event: FileList) {

    // The File object
    const file = event.item(0)

    // Client-side validation example. Must be a .img file
    // if (file.type.split('/')[0] !== 'image') {
    //   console.error('unsupported file type :( ')
    //   return;
    // }

    // The storage path
    const path = `${this.pathPrefix}/${new Date().getTime()}_${file.name}`;

    // The main task
    this.task = this.storage.upload(path, file)

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges()

    // The file's download URL. Emits the url once the upload is complete
    this.downloadURL = this.task.downloadURL();

    // this.downloadURL.subscribe(x => this.uploaded.emit(x));

    this.snapshot = this.task.snapshotChanges().pipe(
      tap(async snap => {
        if (snap.bytesTransferred === snap.totalBytes) {
          // Update firestore on completion
          //this.db.collection(this.pathPrefix).add({ path, size: snap.totalBytes });
          await this.delay(2000);
          //emit the uploaded event and sends the metadata to createWork
          this.storage.storage.ref().child(path).getMetadata().then((metadata) => {
            this.uploaded.emit({hash: metadata.md5Hash, downloadURL: metadata.downloadURLs[0]});

          }).catch(function (error) {
            // Uh-oh, an error occurred!
          });
        }
      })
    )
  }

  // Determines if the upload task is active
  // isActive(snapshot) {
  //   return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
  // }

}
