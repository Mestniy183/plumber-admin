import { getCurrentUser } from "./auth.js";

export async function getUser() {
    const {data: { user}} = await getCurrentUser();
    if(!user){
        alert('Пожалуйста, войдите в систему');
        window.location.href = '/index.html'
        return
    }

    return user;
}