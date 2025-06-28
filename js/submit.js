import { logoutUser } from './auth.js';
import { setupDragAndDrop } from './dragDrop.js'
import { setupFormSubmissions } from './form.js';
import { loadServer } from './loadServer.js';

document.addEventListener('DOMContentLoaded', function () {
    logoutUser()
    loadServer()
    setupDragAndDrop();
    setupFormSubmissions();

});