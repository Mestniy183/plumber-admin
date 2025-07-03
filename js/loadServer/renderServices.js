import { deleteItem } from "./deleteItem.js";


export function renderServices(services, user) {


    const servicesList = document.querySelector('.services__list');
    servicesList.innerHTML = '';


    services.forEach((service, index) => {
        const li = document.createElement('li');
        li.className = 'existing__item';

        const isOwner = service.user_id === user.id
        const adminControls = isOwner
            ? `<button class="delete-btn" data-id="${service.id}">Удалить</button>`
            : "";


        li.innerHTML = `
            <div class="existing__content">
            <span>${index + 1}</span>
                <h3>${service.title}</h3>
                ${service.user_id ? `<small>Автор: ${service.user_id === user.id ? 'Вы' : 'Другой пользователь'}</small>` : ""}
            </div>
            ${adminControls}`
        servicesList.appendChild(li);
    });



    servicesList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteItem(btn.dataset.id, 'services', 'услугу'))
    })


}

