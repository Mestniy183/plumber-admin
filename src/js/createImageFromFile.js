export function createImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось загрузить изображение"));
    };

    img.src = url;
  });
}

export function resizeConvertToWebp(img, maxWidth, maxHeight, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    //Расчитываем новые размеры с сохранением пропорций
    let width = img.width;
    let height = img.height;

    if (width > maxHeight) {
      height = Math.round((height * maxWidth) / width);
      width = maxHeight;
    }

    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
    canvas.width = width;
    canvas.height = height;

    //Рисуем изображения с новыми размерами
    ctx.drawImage(img, 0, 0, width, height);

    //Конвертируем canvas в resizeConvertToWebp
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/webp",
      quality
    ); //Указываем формат webp и качество
  });
}
