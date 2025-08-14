import { renderQuestions } from "./renderQuestions.js";
import { renderServices } from "./renderServices.js";
import { supabaseDB } from "../api.js";
import { getUser } from "../checkAuth.js";
import { renderComment } from "./renderComment.js";
import { renderExample } from "./renderExample.js";

//Контанты для избежания "магических строк"
const ERROR_MSG = '<li class="error">Ошибка загрузки данных </li';
const SELECTORS = {
  services: ".services__list",
  questions: ".question__list",
  comments: ".comment__list",
  examples: ".example__list",
};

//Общая функция для запроса данных из supabase
async function fetchTableData(tableName) {
  const { data, error } = await supabaseDB
    .from(tableName)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}
//Общая функция для обработки ошибок рендеринга
function handleRenderError() {
  Object.values(SELECTORS).forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = ERROR_MSG;
  });
}
export async function loadServer() {
  try {
    const [user, services, questions, comments, examples] = await Promise.all([
      getUser(),
      fetchTableData("services"),
      fetchTableData("questions"),
      fetchTableData("comment"),
      fetchTableData("example"),
    ]);

    //Рендеринг всех компонентов
    renderServices(services, user);
    renderQuestions(questions, user);
    renderComment(comments, user);
    renderExample(examples, user);
  } catch (error) {
    console.error("Ошибка загрузки услуг:", error);
    handleRenderError();
  }
}
