import { supabaseDB } from "./api.js";


export async function loadServer() {
    const servicesList = document.querySelector('.services__list');
     servicesList.innerHTML = '';
    
    try {
        const { data: services, error } = await supabaseDB.from('services').select('*').order('created_at', { ascending: true });

        if (error) throw error;

        services.forEach(service => {
            const li = document.createElement('li');
            li.className = 'service-item';
            li.innerHTML = `
            <div class="service-content">
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            </div>
            <button class="delete-btn" data-id="${service.id}">Удалить</button>`;
            servicesList.appendChild(li);
        });
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        servicesList.innerHTML = '<li class="error">Ошибка загрузки данных</li>';
    }
}