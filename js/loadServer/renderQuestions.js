import { deleteItem } from "./deleteItem.js";

export function renderQuestions(questions, user) {
    const questionsList = document.querySelector('.question__list');
    questionsList.innerHTML = '';


    questions.forEach((question, index) => {
        const li = document.createElement('li');
        li.className = 'existing__item';

        const isOwner = question.user_id === user.id
        const adminControls = isOwner
            ? `<button class="delete-btn" data-id="${question.id}">Удалить</button>`
            : "";

        li.innerHTML = `
            <div class = "existing__content">
            <span>${index + 1}</span>
            <h3>${question.title}</h3>
            ${question.user_id ? `<small>Автор: ${question.user_id === user.id ? 'Вы' : 'Другой пользователь'}</small>` : ""}
            </div>
            ${adminControls}
            `

        questionsList.append(li)
    })


    questionsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteItem(btn.dataset.id, 'questions', 'вопрос'))
    })

}

