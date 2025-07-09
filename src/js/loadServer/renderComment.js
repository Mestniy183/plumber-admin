import { deleteItem } from "./deleteItem.js";
import { renderImage } from "./renderImg.js";

export async function renderComment(comments, user) {
  const commentsList = document.querySelector(".comment__list");
  commentsList.innerHTML = "";

  comments.forEach((comment, index) => {
    const li = document.createElement("li");
    li.className = "existing__item";

    const isOwner = comment.user_id === user.id;
    const adminControls = isOwner
      ? `<button class="delete-btn" data-id="${comment.id}">Удалить</button>`
      : "";

    li.innerHTML = `
            <div class="existing__content">
            <span>${index + 1}</span>
            <h3>${comment.comment}</h3>
            <div class="image-container">
            </div>
            ${comment.user_id ? `<small>Автор: ${comment.user_id === user.id ? "Вы" : "Другой пользователь"}</small>` : ""}
            </div>
            ${adminControls}
            `;

    commentsList.append(li);
    commentsList.querySelectorAll(".image-container").forEach((imgCon) => {
      console.log(imgCon);
      console.log(comment.image);
      renderImage(comment.image);
    });
  });

  commentsList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteItem(btn.dataset.id, "comment", "Отзыв"),
    );
  });
}
