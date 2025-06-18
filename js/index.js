import { setupDragAndDrop } from './dragDrop.js'
import { setupFormSubmissions } from './form.js';
document.addEventListener('DOMContentLoaded', function(){
    //Обработка drag-and-drop для всех форм
    setupDragAndDrop();
    setupFormSubmissions();
});