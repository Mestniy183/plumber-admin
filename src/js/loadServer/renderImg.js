async function renderImage(imageUrl) {
  const container = document.querySelector(".image-container");
  container.innerHTML = "Загрузка...";
  try {
    const response = await fetch(imageUrl);
    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status};`);

    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);
  } catch (error) {
    container.innerHTML = `Ошибка:${error.message}`;
  }
}
