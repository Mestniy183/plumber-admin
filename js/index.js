
import { loginUser } from './auth.js'
document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('loginForm').addEventListener('submit', async(e) =>{
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const errorElement = document.querySelector('.error-login')
        
        const result = await loginUser(email, password)
        
        if(result.success){
            //Перенаправляем или обновляем интерфейс
            window.location.href = '/form.html'
        } else{ 
            errorElement.textContent = result.error
            errorElement.style.display = 'block'
        } 
    })
});