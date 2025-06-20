import { setupDragAndDrop } from './dragDrop.js'
import { setupFormSubmissions } from './form.js';
import { loadServer } from './loadServer.js';
document.addEventListener('DOMContentLoaded', function(){
    //Обработка drag-and-drop для всех форм
    loadServer()
    setupDragAndDrop();
    setupFormSubmissions();
});