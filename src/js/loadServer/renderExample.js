import { deleteItem } from "./deleteItem.js";
import { renderImage } from "./renderImg.js";

export async function renderExample(examples, user) {
  const exampleList = document.querySelector(".example__list");
  exampleList.innerHTML = "";

  examples.forEach((example, index) => {
    const li = document.createElement("li");
    li.className = "existing__item";

    const isOwner = example.user_id === user.id;
    const adminControls = isOwner
      ? `<button class="delete-btn" data-id="${example.id}">Удалить</button>`
      : "";

    li.innerHTML = `
            <div class="existing__content">
            <span>${index + 1}</span>
            <h3>${example.title}</h3>
            <div class="image-container">
            </div>
            ${example.user_id ? `<small>Автор: ${example.user_id === user.id ? "Вы" : "Другой пользователь"}</small>` : ""}
            </div>
            ${adminControls}
            `;

    exampleList.append(li);
    const imageContainer = li.querySelector(".image-container");
    const images = [example.imageBefore, example.imageAfter]
    if (images && Array.isArray(images)) {
      images.forEach(imageUrl => {
        renderImage(imageUrl, imageContainer)
      })
    }
  });

  exampleList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteItem(btn.dataset.id, "example", "Пример"),
    );
  });
}