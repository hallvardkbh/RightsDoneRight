import { Directive, HostListener, HostBinding, Output, EventEmitter } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[dropZone]'
})
export class DropZoneDirective {

  // dropped event. Fired when users drop files in the drop zone
  // event will emit a  fileList which contains the dropped files
  @Output() dropped = new EventEmitter<FileList>();

  // second event called hovered. Emit a boolean (if user is hovered over the drop zone)
  // used to toggle some CSS classes
  @Output() hovered =  new EventEmitter<Boolean>();


  cconstructor() { }

  @HostListener('drop', ['$event'])
  onDrop($event) {
    $event.preventDefault();
    this.dropped.emit($event.dataTransfer.files);
    this.hovered.emit(false);
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event) {
    $event.preventDefault();
    this.hovered.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event) {
    $event.preventDefault();
    this.hovered.emit(false);
  }

}
