
import { supabaseDB } from "./api.js";
import { getCurrentUser } from "./auth.js";
import { loadServer } from "./loadServer.js";

export function setupFormSubmissions(){
    document.querySelector('.services__new-form').addEventListener('submit', async function(e){
        e.preventDefault();


        const {data: { user}} = await getCurrentUser();
            if(!user){
                alert('Пожалуйста, войдите в систему');
                window.location.href = '/index.html'
                return
            }

        if(validateForm(this)){
            const title = this.querySelector('.services-title').value.trim();
            const descr = this.querySelector('.services-description').value.trim();
            await submitForm(this, 'services', title, descr, user.id);
            await loadServer()
        }
   
    });

    // document.querySelector('.example__new-form').addEventListener('submit', function(e){
    //     e.preventDefault();
    //     if(validateForm(this)){
    //         submitForm(this, '/api/examples');
    //     }
    // });


    // document.querySelector('.question__new-form').addEventListener('submit', function(e){
    //     e.preventDefault();
    //     if(validateForm(this)){
    //         submitForm(this, '/api/questions');
    //     }
    // });


    // document.querySelector('.comment__new-form').addEventListener('submit', function(e){
    //     e.preventDefault();
    //     if(validateForm(this)){
    //         submitForm(this, '/api/comments');
    //     }
    // });

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

   async function submitForm(form,url, title, descr, userId){
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
   

        try {
            const formData = {
                title: title,
                description: descr,
                user_id: userId
            }

            const {error: dbError} = await supabaseDB.from(url).insert(formData)

            if(dbError) throw dbError;

            alert('Данные успешно сохранены')
            form.reset()

        } catch (error) {
            console.error('Ошибка:', error);
                alert(`Произошла ошибка при отправке данных: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
           submitBtn.textContent = 'Создать';
        }
    }
}