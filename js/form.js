function setupFormSubmissions(){
    document.querySelector('.services__new-form').addEventListener('submit', function(e){
        e.preventDefault();
        if(validateForm(this)){
            submitForm(this, '/api/services');
        }
    });

    document.querySelector('.example__new-form').addEventListener('submit', function(e){
        e.preventDefault();
        if(validateForm(this)){
            submitForm(this, '/api/examples');
        }
    });


    document.querySelector('.question__new-form').addEventListener('submit', function(e){
        e.preventDefault();
        if(validateForm(this)){
            submitForm(this, '/api/questions');
        }
    });


    document.querySelector('.comment__new-form').addEventListener('submit', function(e){
        e.preventDefault();
        if(validateForm(this)){
            submitForm(this, '/api/comments');
        }
    });

    function validateForm(form){
        let isValid = true;
        const errorElement = form.querySelector('.error-message');
        errorElement.style.display = 'none';
        const requiredInputs = form.querySelectorAll('[required]');
        requiredInputs.forEach(input =>{
            if(!input.value.trim()){
                isValid = false;
                input.style.borderColor = 'red';
            }else{
                input.style.borderColor = '#ddd';
            }
        })

        const fileInputs = form.querySelectorAll('input[type="file"][required]');
        fileInputs.forEach(input =>{
            if(!input.files || input.files.length === 0){
                isValid = false;
                const dropArea = input.closest('.file-upload').querySelector('.drop-area');
                dropArea.style.borderColor = 'red';
            }else{
                const dropArea = input.closest('.file-upload').querySelector('.drop-area');
                dropArea.style.borderColor = '#ccc';
            }
        });


        if(!isValid){
            errorElement.textContent = 'Пожалуйста заполните все обязательные поля!';
            errorElement.style.display = 'block';
        }
        return isValid;
    }
}