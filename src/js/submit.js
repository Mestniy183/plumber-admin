import { logoutUser } from "./auth.js";
import { setupDragAndDrop } from "./dragDrop.js";
import { setupFormSubmissions } from "./form.js";
import { loadServer } from "./loadServer/loadServer.js";
import "../css/style.css";

async function initApp() {
  try {
    logoutUser();
    await loadServer();
    setupDragAndDrop();
    setupFormSubmissions();

    //Показываем контент после загрузки всего
    document.body.classList.add("loaded");
  } catch (error) {
    console.error("Ошибка инициализации приложения:", error);
    document.body.classList.add("loaded"); //Всё равно показываем контент
  }
}

//Ждём загрузки DOM и всех ресурсов
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
document.addEventListener("DOMContentLoaded", function () {
  logoutUser();
  loadServer();
  setupDragAndDrop();
  setupFormSubmissions();
});
