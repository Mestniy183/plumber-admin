import { loginUser, getSession, onAuthStateChange } from "./auth.js";
import "../css/style.css";

//Кэшируем элементы DOM
const DOM = {
  email: () => document.getElementById("email"),
  password: () => document.getElementById("password"),
  loginForm: () => document.getElementById("loginForm"),
  errorElement: () => document.getElementById("error-login"),
};

//Основные пути для перенаправления
const PATHS = {
  home: "/index.html",
};

//Обработчик состояния аутентификации
function handleAuthState(event, session) {
  if (event === "SING_IN") {
    window.location.href = PATHS.home;
  }
}

//Обработчик отправки формы
async function handleLoginSubmit(e) {
  e.preventDefault();

  const { email, password, errorElement } = DOM;
  const errorEl = errorElement();

  try {
    const result = await loginUser(email().value, password().value);

    if (result.success) {
      window.location.href = PATHS.home;
    } else {
      showError(errorEl, result.error);
    }
  } catch (error) {
    showError(errorEl, "Произошла непредвиденная ошибка");
    console.error("Login error:", error);
  }
}

//Показать сообщение об ошибке
function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
}

//Инициализация приложения
async function initAuth() {
  //Проверяем текущую сессию
  const { data } = await getSession();
  if (data?.session) {
    window.location.href = PATHS.home;
    return; //Прекращаем выполнение если пользователь авторизован
  }

  //Настраиваем слушатель изменения состояния аутентификацмм
  onAuthStateChange(handleAuthState);

  //Добавляем обработчик формы
  DOM.loginForm()?.addEventListener("submit", handleLoginSubmit);
}

//Запускаем при загрузке DOM
document.addEventListener("DOMContentLoaded", initAuth);
