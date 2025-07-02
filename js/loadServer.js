import { supabaseDB } from "./api.js";
import { getUser } from "./checkAuth.js";


export async function loadServer() {

    //Проверяем авторизацию
    const user = await getUser()

    const servicesList = document.querySelector('.services__list');
    const questionsList = document.querySelector('.question__list');
     servicesList.innerHTML = '';
    questionsList.innerHTML = '';
    try {
        // const { data: services, error } = await supabaseDB.from('services').select('*').order('created_at', { ascending: true });
        const[servicesResult, questiosnResult] = await Promise.all([
            supabaseDB.from('services').select('*').order('created_at', { assending: true}),
            supabaseDB.from('questions').select('*').order('created_at', {assending: true})
        ]);


        // if (error) throw error;
        if(servicesResult.error) throw servicesResult.error;
        if(questiosnResult.error) throw questiosnResult.error;

        const services = servicesResult.data;
        const questions = questiosnResult.data;

        services.forEach((service, index) => {
            const li = document.createElement('li');
            li.className = 'existing__item';

            const isOwner = service.user_id === user.id
            const adminControls = isOwner
            ?`<button class="delete-btn" data-id="${service.id}">Удалить</button>`
            :"";


            li.innerHTML = `
            <div class="existing__content">
            <span>${index + 1}</span>
                <h3>${service.title}</h3>
                ${service.user_id ? `<small>Автор: ${service.user_id === user.id ? 'Вы': 'Другой пользователь'}</small>` : ""}
            </div>
            ${adminControls}`
            servicesList.appendChild(li);
        });

        questions.forEach((question, index) => {
            const li = document.createElement('li');
            li.className = 'existing__item';

            const isOwner = question.user_id === user.id
            const adminControls = isOwner
            ?`<button class="delete-btn" data-id="${question.id}">Удалить</button>`
            :"";

            li.innerHTML = `
            <div class = "existing__content">
            <span>${index + 1}</span>
            <h3>${question.title}</h3>
            ${question.user_id ? `<small>Автор: ${question.user_id === user.id ? 'Вы': 'Другой пользователь'}</small>` : ""}
            </div>
            ${adminControls}
            `

            questionsList.append(li)
        })

        document.querySelectorAll('.services__list .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.id, 'services', 'услугу') )
        })

        document.querySelectorAll('.question__list .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.id, 'questions', 'вопрос') )
        })
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        servicesList.innerHTML = '<li class="error">Ошибка загрузки данных</li>';
        questionsList.innerHTML = '<li class="error">Ошибка загрузки данных</li>';
    }
}

async function deleteItem(itemId, tableName, itemName){
    try {

        if(!confirm(`Вы уверены, что хотите удалить этот ${itemName}?`)){
            return;
        }

        const user = await getUser()

        const{error} = await supabaseDB
        .from(tableName)
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

        if(error) throw error;

        //Обновляем список после удаления
        await loadServer();
        alert(`${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Успешно удалён`);

    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert(`Не удалось удалить услугу ${itemName}`);
    }
}