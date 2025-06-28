import { supabaseDB } from "./api.js";

export async function loginUser(email, password) {
    try {
        const{data, error} = await supabaseDB.auth.signInWithPassword({
            email: email,
            password: password
        })
        if(error){
            console.error('Login error:', error.message)
            return {success: false, error: error.message}
        }
        console.log('User logged in:', data.user)
        return {success: true, user: data.user}
    } catch (err) {
        console.error('Unexpected error:', err)
        return {success: false, error: 'Произошла ошибка'}
    }
}

export async function logoutUser(){
    const logoutBtn = document.querySelector('.logout');
    logoutBtn.addEventListener('click', async function() {
        const {error} = await supabaseDB.auth.signOut();
        if(error) console.error('Logout error:', error);
    })
    

   
}

export function getCurrentUser(){
    return supabaseDB.auth.getUser()
}