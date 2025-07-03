
import { renderQuestions } from "./renderQuestions.js";
import { renderServices } from "./renderServices.js";
import { supabaseDB } from "../api.js";
import { getUser } from "../checkAuth.js";


export async function loadServer() {

    //Проверяем авторизацию
    const user = await getUser()

    try {
        // const { data: services, error } = await supabaseDB.from('services').select('*').order('created_at', { ascending: true });
        const[servicesResult, questiosnResult] = await Promise.all([
            supabaseDB.from('services').select('*').order('created_at', { assending: true}),
            supabaseDB.from('questions').select('*').order('created_at', {assending: true})
        ]);


        if(servicesResult.error) throw servicesResult.error;
        if(questiosnResult.error) throw questiosnResult.error;

        const services = servicesResult.data;
        const questions = questiosnResult.data;

        renderServices(services, user);
        renderQuestions(questions, user)
      

    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        document.querySelector('.services__list').innerHTML = '<li class="error">Ошибка загрузки данных</li>';
        document.querySelector('.question__list').innerHTML = '<li class="error">Ошибка загрузки данных</li>';
    }
}

