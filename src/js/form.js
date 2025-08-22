import { PutObjectCommand } from "@aws-sdk/client-s3";
import { supabaseDB, client } from "./api.js";
import { getUser } from "./checkAuth.js";
import { loadServer } from "./loadServer/loadServer.js";
import { readFileAsBuffer } from "./arrayBuffer.js";
import {
  createImageFromFile,
  resizeConvertToWebp,
} from "./createImageFromFile.js";

//Общие константы
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

export function setupFormSubmissions() {
  //Общие обработчики для разных форма
  setupFormHandler(".services__new-form", "services", async (form) => {
    return {
      title: form.querySelector(".services-title").value.trim(),
      descr: form.querySelector(".services-description").value.trim(),
    };
  });

  setupFormHandler(".question__new-form", "questions", async (form) => {
    return {
      title: form.querySelector(".question-title").value.trim(),
      descr: form.querySelector(".question-descr").value.trim(),
    };
  });

  setupFormHandler(
    ".comment__new-form",
    "comment",
    async (form) => {
      return {
        comment: form.querySelector(".comment__text").value.trim(),
        name: form.querySelector(".comment__name").value.trim(),
        city: form.querySelector(".comment__city").value.trim(),
        imageFile: form.querySelector(".comment__photo"),
      };
    },
    submitCommentForm
  );

  setupFormHandler(
    ".example__new-form",
    "example",
    async (form) => {
      return {
        imageBefore: form.querySelector(".example-photo-1"),
        imageAfter: form.querySelector(".example-photo-2"),
        title: form.querySelector(".example-title").value.trim(),
        task: form.querySelector(".example-task").value.trim(),
        solution: form.querySelector(".example-solution").value.trim(),
      };
    },
    submitExampleForm
  );
}

function setupFormHandler(
  selector,
  type,
  extractDataFn,
  customSubmitFn = submitForm
) {
  console.log(selector);
  document
    .querySelector(selector)
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const user = await getUser();

      if (validateForm(this)) {
        const formData = await extractDataFn(this);
        await customSubmitFn(this, type, { ...formData, userId: user.id });
        await loadServer();
      }
    });
}

function validateForm(form) {
  let isValid = true;
  const errorElement = form.querySelector(".error-message");
  errorElement.style.display = "none";

  const requiredInputs = form.querySelectorAll("[required]");
  requiredInputs.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false;
      input.style.borderColor = "red";
    } else {
      input.style.borderColor = "#ddd";
    }
  });

  //Проверка файловых полей
  form.querySelectorAll('input[type="file"][required]').forEach((input) => {
    const hasFiles = input.files && input.files.length > 0;
    if (!hasFiles) {
      isValid = false;
      const dropArea = input
        .closest(".file-upload")
        ?.querySelector(".drop-area");
      if (dropArea) dropArea.style.borderColor = "red";
    }
  });

  if (!isValid) {
    errorElement.textContent = "Пожалуйста заполните все обязательные поля!";
    errorElement.style.display = "block";
  }
  return isValid;
}

async function submitForm(form, url, { title, descr, userId }) {
  const submitBtn = form.querySelector(".submit-btn");

  try {
    setButtonState(submitBtn, true, "Отправка...");

    const { error: dbError } = await supabaseDB.from(url).insert({
      title,
      description: descr,
      user_id: userId,
    });

    if (dbError) throw dbError;

    showSuccess(form, "Данные успешно сохранены");
  } catch (error) {
    handleError(error);
  } finally {
    setButtonState(submitBtn, false, "Создать");
  }
}

async function submitCommentForm(
  form,
  type,
  { comment, name, city, imageFile, userId }
) {
  const submitBtn = form.querySelector(".submit-btn");

  try {
    setButtonState(submitBtn, true, "Отправка...");
    const imageUrls =
      imageFile.files?.length > 0
        ? await processCommentImage(imageFile.files[0])
        : {};

    console.log(type);

    const { error: dbError } = await supabaseDB.from(type).insert({
      comment,
      name,
      city,
      image: imageUrls["1x"],
      image_2x: imageUrls["2x"],
      image_3x: imageUrls["3x"],
      image_mobile_1: imageUrls["mobile_1"],
      image_mobile_1_2x: imageUrls["mobile_1_2x"],
      image_mobile_2: imageUrls["mobile_2"],
      image_mobile_2_2x: imageUrls["mobile_2_2x"],
      user_id: userId,
    });

    if (dbError) throw dbError;
    showSuccess(form, "Отзыв успешно добавлен!");
  } catch (error) {
    handleError(error);
  } finally {
    setButtonState(submitBtn, false, "Создать");
  }
}

async function submitExampleForm(
  form,
  type,
  { imageBefore, imageAfter, title, task, solution, userId }
) {
  const submitBtn = form.querySelector(".submit-btn");

  try {
    setButtonState(submitBtn, true, "Отправка...");

    const [imageUrlsBefore, imageUrlsAfter] = await Promise.all([
      processExampleImage(imageBefore, "before"),
      processExampleImage(imageAfter, "after"),
    ]);

    console.log(imageUrlsBefore);
    console.log(imageUrlsAfter);

    const { error: dbError } = await supabaseDB.from(type).insert({
      imageBefore: imageUrlsBefore?.["1x"],
      imageBefore_2x: imageUrlsBefore?.["2x"],
      imageBefore_3x: imageUrlsBefore?.["3x"],
      imageBefore_mobile: imageUrlsBefore?.["mobile_1x"],
      imageBefore_mobile_2x: imageUrlsBefore?.["mobile_2x"],
      imageAfter: imageUrlsAfter?.["1x"],
      imageAfter_2x: imageUrlsAfter?.["2x"],
      imageAfter_3x: imageUrlsAfter?.["3x"],
      imageAfter_mobile: imageUrlsAfter?.["mobile_1x"],
      imageAfter_mobile_2x: imageUrlsAfter?.["mobile_2x"],
      title,
      task,
      solution,
      user_id: userId,
    });

    if (dbError) throw dbError;

    showSuccess(form, "Пример успешно добавлен!");
  } catch (error) {
    handleError(error);
  } finally {
    setButtonState(submitBtn, false, "Создать");
  }
}

//Вспомогательные функции
async function processCommentImage(file) {
  validateFile(file);

  const versions = {
    "1x": { width: 366, height: 366 },
    "2x": { width: 732, height: 732 },
    "3x": { width: 1098, height: 1098 },
    module_1: { width: 366, height: 250 },
    module_1_2x: { width: 732, height: 500 },
    module_2: { width: 366, height: 200 },
    module_2_2x: { width: 732, height: 400 },
  };
  return processImage(file, versions, "comment");
}

async function processExampleImage(fileInput, prefix) {
  if (!fileInput?.files?.length) return null;
  const file = fileInput.files[0];
  validateFile(file);

  const versions = {
    "1x": { width: 533, height: 531 },
    "2x": { width: 1066, height: 1062 },
    "3x": { width: 1599, height: 1593 },
    mobile_1x: { width: 449, height: 440 },
    mobile_2x: { width: 898, height: 880 },
  };

  return processImage(file, versions, "example", prefix);
}

function validateFile(file) {
  if (!(file instanceof File)) {
    throw new Error("Файл не допустимого типа");
  }
  const fileExt = file.name.split(".").pop().toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(fileExt)) {
    throw new Error("Неподдерживаемый формат файла");
  }
}

async function processImage(file, versions, bucket, prefix = "") {
  const img = await createImageFromFile(file);
  const resultUrls = {};
  await Promise.all(
    Object.entries(versions).map(async ([version, size]) => {
      const resizedImageBlob = await resizeConvertToWebp(
        img,
        size.width,
        size.height
      );
      const fileName = `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}-${version}.webp`;
      const filePath = `${bucket}-${fileName}`;

      await uploadToS3(
        bucket,
        filePath,
        await readFileAsBuffer(resizedImageBlob)
      );
      resultUrls[version] = getSupabaseUrl(bucket, filePath);
    })
  );

  return resultUrls;
}

async function uploadToS3(bucket, key, body) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: "image/webp",
  });
  return client.send(command);
}

function getSupabaseUrl(bucket, filePath) {
  console.log(bucket);
  return `https://voygehzdwnkrsowhseyh.supabase.co/storage/v1/object/public/${bucket}/${filePath}`;
}

function setButtonState(button, disabled, text) {
  button.disabled = disabled;
  button.textContent = text;
}

function showSuccess(form, message) {
  alert(message);
  form.reset();
  form.querySelectorAll("file-preview").forEach((el) => (el.innerHTML = ""));
}

function handleError(error) {
  console.error("Ошибка:", error);
  alert(`Произошла ошибка при отправке данных: ${error.message}`);
}
