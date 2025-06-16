export function setupDragAndDrop(){
    const dropAreas = document.querySelectorAll('drop-area');

    dropAreas.forEach(dropArea =>{
        const fileInput = dropArea.querySelector('.file-input');
        const preview = dropArea.closest('file-upload').querySelector('.file-preview');
        ['dragenter','dragover','dragleave','drop'].forEach(eventName => {
            dropArea.addEventListener(eventName,preventDefaults,false)
        });
        ['dragenter','dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName,highlight,false)
        });
        ['dragleave','drop'].forEach(eventName => {
            dropArea.addEventListener(eventName,unhighlight,false)
        });
    })
}