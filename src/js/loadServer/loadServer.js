import { renderQuestions } from "./renderQuestions.js";
import { renderServices } from "./renderServices.js";
import { supabaseDB } from "../api.js";
import { getUser } from "../checkAuth.js";
import { renderComment } from "./renderComment.js";
import { renderExample } from "./renderExample.js";

export async function loadServer() {
  try {
    // const { data: services, error } = await supabaseDB.from('services').select('*').order('created_at', { ascending: true });
    const [
      user,
      servicesResult,
      questiosnResult,
      commentResult,
      exampleResult,
    ] = await Promise.all([
      getUser(),
      supabaseDB
        .from("services")
        .select("*")
        .order("created_at", { assending: true }),
      supabaseDB
        .from("questions")
        .select("*")
        .order("created_at", { assending: true }),
      supabaseDB
        .from("comment")
        .select("*")
        .order("created_at", { assending: true }),
      supabaseDB
        .from("example")
        .select("*")
        .order("created_at", { assending: true }),
    ]);

    //Проверяем ошибки одним блоком
    const errors = [
      servicesResult.error,
      questiosnResult.error,
      commentResult.error,
      exampleResult.error,
    ].filter(Boolean);

    if (errors.length > 0) throw errors[0];

    await Promise.all([
      renderServices(servicesResult.data, user),
      renderQuestions(questiosnResult.data, user),
      renderComment(commentResult.data, user),
      renderExample(exampleResult.data, user),
    ]);
  } catch (error) {
    console.error("Ошибка загрузки услуг:", error);
    //Устанавливаем сообщения об ошибках для всех компонентов
    const errorHTML = '<li class="error">Ошибка загрузки данных</li>';
    const containers = [
      ".services__list",
      ".question__list",
      ".comment__list",
      ".example__list",
    ];

    containers.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) element.innerHTML = errorHTML;
    });
  }
}
