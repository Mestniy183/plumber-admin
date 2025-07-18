import { supabaseDB } from "./api.js";

export async function loginUser(email, password) {
    try {
        const{data, error} = await supabaseDB.auth.signInWithPassword({
            email: email,
            password: password
        })

        if(!error) {
            await supabaseDB.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            })
        }

        if(error){
            console.error('Login error:', error.message)
            return {success: false, error: error.message}
        }

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
        window.location.href = '/'
        if(error) console.error('Logout error:', error);
    })
    

   
}

export function getCurrentUser(){
    return supabaseDB.auth.getUser()
}

export async function getSession() {
    const { data, error } = await supabaseDB.auth.getSession()
    return { data, error}
}

export function onAuthStateChange(callback) {
    return supabaseDB.auth.onAuthStateChange((event, session) =>{
        callback(event, session)
    })
}