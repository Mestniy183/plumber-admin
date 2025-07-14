import { PutObjectCommand } from "@aws-sdk/client-s3";
import { supabaseDB, client } from "./api.js";
import { getUser } from "./checkAuth.js";
import { loadServer } from "./loadServer/loadServer.js";
import { readFileAsBuffer } from "./arrayBuffer.js";

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
      let imageUrl = null;

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

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}.${fileExt}`;
        const filePath = `comment-${fileName}`;

        const fileBuffer = await readFileAsBuffer(file);

        const params = {
          Bucket: "comment",
          Key: filePath,
          Body: fileBuffer,
          ContentType: file.type,
        };
        const command = new PutObjectCommand(params);

        const data = await client.send(command);

        if (!data) throw new Error("Error send photo");

        imageUrl = `https://voygehzdwnkrsowhseyh.storage.supabase.co/v1/object/public/comment/${filePath}`;
      }

      const formData = {
        comment: comment,
        name: name,
        city: city,
        image: imageUrl,
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
      let imageUrl1 = null;
      let imageUrl2 = null;

      const uploadFile = async (fileInput) => {
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
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}.${fileExt}`;
        const filePath = `example-${fileName}`;

        const fileBuffer = await readFileAsBuffer(file);

        const params = {
          Bucket: "example",
          Key: filePath,
          Body: fileBuffer,
          ContentType: file.type,
        };
        const command = new PutObjectCommand(params);

        const data = await client.send(command);
        if (!data) throw new Error("Ошибка при загрузке фото");

        return `https://voygehzdwnkrsowhseyh.storage.supabase.co/v1/object/public/example/${filePath}`;
      };

      //Загружаем оба файла(если они есть)
      if (imageBefore.files && imageBefore.files.length > 0) {
        imageUrl1 = await uploadFile(imageBefore);
      }

      if (imageAfter.files && imageAfter.files.length > 0) {
        imageUrl2 = await uploadFile(imageAfter);
      }

      const formData = {
       imageBefore: imageUrl1,
       imageAfter: imageUrl2,
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
      previews.forEach(preview => preview.innerHTML = "");
    } catch (error) {
      console.error("Ошибка:", error);
      alert(`Произошла ошибка при отправке данных: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Создать";
    }
  }
}
