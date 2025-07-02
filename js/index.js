
import { loginUser, getSession, onAutStateChange } from './auth.js';

document.addEventListener('DOMContentLoaded', function(){

    getSession().then(({data}) =>{
        console.log(data);
        if(data.session) {
            window.location.href = '/index.html'
        }else{
            window.location.href = '/login.html'
        }
    })

    onAutStateChange((event, session) => {
        console.log(event);
        console.log(session);
        if (event === 'SIGNED_IN') {
            window.location.href = '/index.html' 
        }else{
            window.location.href = '/login.html'
        }
    })


    document.getElementById('loginForm').addEventListener('submit', async(e) =>{
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const errorElement = document.querySelector('.error-login')
        
        const result = await loginUser(email, password)
        
        if(result.success){
            //Перенаправляем или обновляем интерфейс
            window.location.href = '/index.html'
        } else{ 
            errorElement.textContent = result.error
            errorElement.style.display = 'block'
        } 
    })


});