import { PutObjectCommand } from "@aws-sdk/client-s3";
import { supabaseDB, client } from "./api.js";
import { getUser } from "./checkAuth.js";
import { loadServer } from "./loadServer/loadServer.js";
import { readFileAsBuffer } from "./arrayBuffer.js";
import {
  createImageFromFile,
  resizeConvertToWebp,
} from "./createImageFromFile.js";

export function setupFormSubmissions() {
  document
    .querySelector(".services__new-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const user = await getUser();

      if (validateForm(this)) {
        const title = this.querySelector(".services-title").value.trim();
        const descr = this.querySelector(".services-description").value.trim();
        await submitForm(this, "services", title, descr, user.id);
        await loadServer();
      }
    });

  document
    .querySelector(".question__new-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const user = await getUser();

      if (validateForm(this)) {
        const title = this.querySelector(".question-title").value.trim();
        const descr = this.querySelector(".question-descr").value.trim();
        await submitForm(this, "questions", title, descr, user.id);
        await loadServer();
      }
    });

  document
    .querySelector(".comment__new-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const user = await getUser();

      if (validateForm(this)) {
        const comment = this.querySelector(".comment__text").value.trim();
        const name = this.querySelector(".comment__name").value.trim();
        const city = this.querySelector(".comment__city").value.trim();
        const imageFile = this.querySelector(".comment__photo");

        await submitCommentForm(this, comment, name, city, imageFile, user.id);

        await loadServer();
      }
    });

  document
    .querySelector(".example__new-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const user = await getUser();

      if (validateForm(this)) {
        const imageBefore = this.querySelector(".example-photo-1");
        const imageAfter = this.querySelector(".example-photo-2");
        const title = this.querySelector(".example-title").value.trim();
        const task = this.querySelector(".example-task").value.trim();
        const solution = this.querySelector(".example-solution").value.trim();
        await submitExampleForm(
          this,
          imageBefore,
          imageAfter,
          title,
          task,
          solution,
          user.id
        );
        await loadServer();
      }
    });

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

    const fileInputs = form.querySelectorAll('input[type="file"][required]');
    fileInputs.forEach((input) => {
      if (!input.files || input.files.length === 0) {
        isValid = false;
        const dropArea = input
          .closest(".file-upload")
          .querySelector(".drop-area");
        dropArea.style.borderColor = "red";
      } else {
        const dropArea = input
          .closest(".file-upload")
          .querySelector(".drop-area");
        dropArea.style.borderColor = "#ccc";
      }
    });

    if (!isValid) {
      errorElement.textContent = "Пожалуйста заполните все обязательные поля!";
      errorElement.style.display = "block";
    }
    return isValid;
  }

  async function submitForm(form, url, title, descr, userId) {
    const submitBtn = form.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";

    try {
      const formData = {
        title: title,
        description: descr,
        user_id: userId,
      };

      const { error: dbError } = await supabaseDB.from(url).insert(formData);

      if (dbError) throw dbError;

      alert("Данные успешно сохранены");
      form.reset();
    } catch (error) {
      console.error("Ошибка:", error);
      alert(`Произошла ошибка при отправке данных: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Создать";
    }
  }

  async function submitCommentForm(
    form,
    comment,
    name,
    city,
    fileInput,
    userId
  ) {
    const submitBtn = form.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";

    try {
      let imageUrls = {};

      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];

        if (!(file instanceof File)) {
          throw new Error("Файл не допустимого типа");
        }

        const fileExt = file.name.split(".").pop().toLowerCase();
        const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

        if (!allowedExtensions.includes(fileExt)) {
          throw new Error("Неподдерживаемый формат файла");
        }

        const versions = {
          "1x": { width: 366, height: 366 }, //1x(366*366)
          "2x": { width: 732, height: 732 }, //2x(732*732)
          "3x": { width: 1098, height: 1098 }, //3x размер
          mobile_1: { width: 366, height: 250 }, //Мобильная версии 1
          mobile_1_2x: { width: 732, height: 500 }, //2x(732X500)
          mobile_2: { width: 366, height: 200 }, //1x(366X200)
          mobile_2_2x: { width: 732, height: 400 }, //2x()
        };

        const img = await createImageFromFile(file);

        //Обрабатываем каждую версию
        for (const [version, size] of Object.entries(versions)) {
          //Изменяем размер изображения и конвертируем в webp
          const resizedImageBlob = await resizeConvertToWebp(
            img,
            size.width,
            size.height
          );

          //Генерируем уникальное имя файла для каждой версии
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}-${version}.webp`;

          const filePath = `comment-${fileName}`;

          const fileBuffer = await readFileAsBuffer(resizedImageBlob);

          const params = {
            Bucket: "comment",
            Key: filePath,
            Body: fileBuffer,
            ContentType: "image/webp",
          };
          const command = new PutObjectCommand(params);

          const data = await client.send(command);

          if (!data) throw new Error("Error send photo");
          imageUrls[
            version
          ] = `https://voygehzdwnkrsowhseyh.supabase.co/storage/v1/object/public/comment/${filePath}`;
        }
      }

      const formData = {
        comment: comment,
        name: name,
        city: city,
        image: imageUrls["1x"], //основное изображение
        image_2x: imageUrls["2x"], //2x версия
        image_3x: imageUrls["3x"], //3x
        //Мобильная версия (366*250 и 2х)
        image_mobile_1: imageUrls["mobile_1"], //366x250(1x)
        image_mobile_1_2x: imageUrls["mobile_1_2x"], //732x300(2x)
        //Мобильная версия (366Х200 и 2х)
        image_mobile_2: imageUrls["mobile_2"], //366x200(1x)
        image_mobile_2_2x: imageUrls["mobile_2_2x"], //732x400(2x)
        user_id: userId,
      };

      const { error: dbError } = await supabaseDB
        .from("comment")
        .insert(formData);

      if (dbError) throw dbError;

      //Успешная отправка
      alert("Отзыв успешно добавлен!");
      form.reset();

      //Очищаем превью изображения
      const preview = form.querySelector(".file-preview");
      preview.innerHTML = "";
    } catch (error) {
      console.error("Ошибка:", error);
      alert(`Произошла ошибка при отправке данных: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Создать";
    }
  }

  async function submitExampleForm(
    form,
    imageBefore,
    imageAfter,
    title,
    task,
    solution,
    userId
  ) {
    const submitBtn = form.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";

    try {
      let imageUrlsBefore = {};
      let imageUrlsAfter = {};

      const uploadAndProcessImage = async (fileInput, prefix) => {
        if (!fileInput || fileInput.files.length === 0) return null;

        const file = fileInput.files[0];
        if (!(file instanceof File)) {
          throw new Error("Файл не допустимого типа");
        }

        const fileExt = file.name.split(".").pop().toLowerCase();
        const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

        if (!allowedExtensions.includes(fileExt)) {
          throw new Error("Неподдерживаемый формат файла");
        }

        const versions = {
          "1x": { width: 533, height: 531 }, // оригинальный размер
          "2x": { width: 1066, height: 1062 }, // 2x размер
          "3x": { width: 1599, height: 1593 }, // 3x размер
          mobile_1x: { width: 449, height: 440 }, //Мобильная версия(1x)
          mobile_2x: { width: 898, height: 880 }, //Мобильная версия(2x)
        };

        const img = await createImageFromFile(file);
        const resultUrls = {};

        for (const [version, size] of Object.entries(versions)) {
          //Изменяем размер изображения и конвертируем в webp
          const resizedImageBlob = await resizeConvertToWebp(
            img,
            size.width,
            size.height
          );
          //Генерируем уникальное имя файла
          const fileName = `${prefix}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}-${version}.webp`;

          const filePath = `example-${fileName}`;
          const fileBuffer = await readFileAsBuffer(resizedImageBlob);

          const params = {
            Bucket: "example",
            Key: filePath,
            Body: fileBuffer,
            ContentType: "image/webp",
          };
          const command = new PutObjectCommand(params);

          await client.send(command);
          resultUrls[
            version
          ] = `https://voygehzdwnkrsowhseyh.supabase.co/storage/v1/object/public/example/${filePath}`;
        }

        return resultUrls;
      };

      //Загружаем оба файла(если они есть)
      if (imageBefore.files && imageBefore.files.length > 0) {
        imageUrlsBefore = await uploadAndProcessImage(imageBefore, "before");
      }

      if (imageAfter.files && imageAfter.files.length > 0) {
        imageUrlsAfter = await uploadAndProcessImage(imageAfter, "after");
      }

      const formData = {
        imageBefore: imageUrlsBefore["1x"] || null,
        imageBefore_2x: imageUrlsBefore["2x"] || null,
        imageBefore_3x: imageUrlsBefore["3x"] || null,
        imageBefore_mobile: imageUrlsBefore["mobile_1x"] || null,
        imageBefore_mobile_2x: imageUrlsBefore["mobile_2x"] || null,
        imageAfter: imageUrlsAfter["1x"] || null,
        imageAfter_2x: imageUrlsAfter["2x"] || null,
        imageAfter_3x: imageUrlsAfter["3x"] || null,
        imageAfter_mobile: imageUrlsAfter["mobile_1x"] || null,
        imageAfter_mobile_2x: imageUrlsAfter["mobile_2x"] || null,
        title: title,
        task: task,
        solution: solution,
        user_id: userId,
      };

      const { error: dbError } = await supabaseDB
        .from("example")
        .insert(formData);

      if (dbError) throw dbError;

      //Успешная отправка
      alert("Пример успешно добавлен!");
      form.reset();

      //Очищаем превью изображения
      const previews = form.querySelectorAll(".file-preview");
      previews.forEach((preview) => (preview.innerHTML = ""));
    } catch (error) {
      console.error("Ошибка:", error);
      alert(`Произошла ошибка при отправке данных: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Создать";
    }
  }
}
