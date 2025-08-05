export async function renderImage(imageUrl, container) {
  if (!container) return;

  //Создаём отдельный контейнер для каждой картинки
  const imageWrapper = document.createElement("div");
  imageWrapper.className = "image-wrapper";
  imageWrapper.style.margin = "10px 0";

  //Добавляем индикатор загрузки
  imageWrapper.innerHTML = "Загрузка...";
  container.appendChild(imageWrapper);
  try {
    const response = await fetch(imageUrl, {
      mode: "cors",
      headers: {
        Origin: window.location.origin,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status};`);
    }

    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);
    //Создаём <img>
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = blobUrl;
    img.style.maxWidth = "100%";
    img.style.maxHeight = "200px";
    img.style.objectFit = "contain";

    img.onload = () => {
      imageWrapper.innerHTML = "";
      imageWrapper.append(img);
      URL.revokeObjectURL(blobUrl);
      //Освобождаем память
    };

    img.onerror = () => {
      throw new Error("Ошибка загрузки изображения");
    };
  } catch (error) {
    imageWrapper.innerHTML = `Ошибка:${error.message}`;
    const fallbackLink = document.createElement("a");
    fallbackLink.href = imageUrl;
    fallbackLink.target = "_blank";
    fallbackLink.rel = "noopener noreferrer";
    fallbackLink.textContent = "Открыть изображение в новой вкладке";
    imageWrapper.innerHTML = "";
    imageWrapper.append(fallbackLink);
  }
}
