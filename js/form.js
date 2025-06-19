const supabaseURL = 'https://voygehzdwnkrsowhseyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveWdlaHpkd25rcnNvd2hzZXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjI0ODYsImV4cCI6MjA2NTg5ODQ4Nn0.zf0QL4lGuSv1jT4cLPD2UGBEiv4JgSp0lVoLKC47AGc'

const supabaseDB = supabase.createClient(supabaseURL, supabaseKey)


export function setupFormSubmissions(){
    document.querySelector('.services__new-form').addEventListener('submit', async function(e){
        e.preventDefault();
        if(validateForm(this)){
            const title = this.querySelector('.services-title')
            const descr = this.querySelector('.services-description')
            await submitForm(this, 'services', title, descr);
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

   async function submitForm(form,url, title, descr){
        // const formData = new FormData(form);
        // console.log(formData);
        const submitBtn = form.querySelector('.submit-btn');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
   

        try {
            const formData = {
                title: title,
                description: descr
            }
           

            console.log(formData);

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

        // fetch(url,{
        //     method: 'POST',
        //     body: formData
        // })
        // .then(response =>{
        //     if(!response.ok) throw new Error('Ошибка сети');
        //     return response.json();
        // })
        // .then(data =>{
        //     alert('Данные успешно сохранены!');
        //     form.reset();
        //     //Очишаем превью изображений
        //     form.querySelectorAll('.file-preview').forEach(preview =>{
        //         preview.innerHTML = '';
        //     });
        // })
        // .catch(error => {
        //     console.error('Ошибка:', error);
        //     alert('Произошла ошибка при отправке данных');
        // })
        // .finally(() => {
        //     submitBtn.disabled = false;
        //     submitBtn.textContent = 'Создать';
        // })
    }
}