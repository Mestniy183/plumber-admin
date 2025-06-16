export function setupDragAndDrop() {
    console.log(1);
    const dropAreas = document.querySelectorAll('drop-area');

    dropAreas.forEach(dropArea => {
        const fileInput = dropArea.querySelector('.file-input');
        const preview = dropArea.closest('file-upload').querySelector('.file-preview');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false)
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false)
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false)
        });

        dropArea.addEventListener('drop', handleDrop, false);
        fileInput.addEventListener('change', handleFileSelect);

        function handleFileSelect() {
            if (fileInput.files.length) {
                handleFile(fileInput.files[0], fileInput, preview);
            }
        }
    })

    function preventDefaults(e) {
        e.preventDefaults();
        e.stopPropagation();
    }
    function highlight() {
        this.classList.add('highlight');
    }
    function unhighlight() {
        this.classList.remove('highlight');
    }
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        const fileInput = this.querySelector('.file-input');
        const preview = this.closest('.file-upload').querySelector('.file-preview');

        if (files.length) {
            fileInput.files = files;
            handleFile(files[0], fileInput, preview);
        }
    }

    function handleFile(file, fileInput, preview) {
        if (!file.type.startsWith('image/')) {
            showError(preview, 'Файл не является изображением!');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError(preview, 'Файл слишком большой! Максимальный размер: 5MB');
            return;
        }

        preview.innerHTML = '';

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Удалить';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = function () {
            fileInput.value = '';
            preview.innerHTML = '';
        };

    }

    function showError(preventElement, message) {
        preventElement.innerHTML = `<div style="color:red;">${message}</div>`
    }
}