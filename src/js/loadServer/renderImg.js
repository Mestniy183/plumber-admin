export async function renderImage(imageUrl) {
  const container = document.querySelector(".image-container");
  container.innerHTML = "Загрузка...";
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status};`);
    }

    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);
    //Создаём <img>
    const img = new Image();
    img.src = blobUrl;
    img.style.maxWidth = "100%";
    img.style.height = "100%";

    img.onload = () => {
      container.innerHTML = "";
      container.append(img);
      URL.revokeObjectURL(blobUrl);
      //Освобождаем память
    };

    img.onerror = () => {
      throw new Error("Ошибка загрузки изображения");
    };
  } catch (error) {
    container.innerHTML = `Ошибка:${error.message}`;
  }
}
