import { supabaseDB } from "./api.js";


export async function loadServer() {
    const servicesList = document.querySelector('.services__list');
     servicesList.innerHTML = '';
    
    try {
        const { data: services, error } = await supabaseDB.from('services').select('*').order('created_at', { ascending: true });

        if (error) throw error;

        services.forEach((service, index) => {
            const li = document.createElement('li');
            li.className = 'existing__item';
            li.innerHTML = `
            <div class="existing__content">
            <span>${index + 1}</span>
                <h3>${service.title}</h3>
            </div>
            <button class="delete-btn" data-id="${service.id}">Удалить</button>`;
            servicesList.appendChild(li);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if(confirm('Вы уверены, что хотите удалить эту услугу?')){
                    await deleteService(btn.dataset.id);
                }
            })
        })
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        servicesList.innerHTML = '<li class="error">Ошибка загрузки данных</li>';
    }
}

async function deleteService(serviceId){
    try {
        const{error} = await supabaseDB
        .from('services')
        .delete()
        .eq('id', serviceId);

        if(error) throw error;

        //Обновляем список после удаления
        await loadServer();
        alert('Услуга успешно удалена');

    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Не удалось удалить услугу');
    }
}