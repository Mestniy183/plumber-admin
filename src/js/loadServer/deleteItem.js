import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { client, supabaseDB } from "../api.js";
import { getUser } from "../checkAuth.js";
import { loadServer } from "./loadServer.js";

export async function deleteItem(itemId, tableName, itemName) {
  try {
    if (!confirm(`Вы уверены, что хотите удалить этот ${itemName}?`)) {
      return;
    }

    const user = await getUser();
    const { data: item, error: fetchError } = await supabaseDB
      .from(tableName)
      .select("*")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    for (const key in item) {
      if (key.includes("image")) {
        const imageUrl = item[key];

        try {
          const bucket = tableName === "comment" ? "comment" : "example";
          const imageKey = extractKeyFromUrl(imageUrl, bucket);

          const deleteParams = {
            Bucket: bucket,
            Key: imageKey,
          };

          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await client.send(deleteCommand);
        } catch (error) {
          console.error(`Ошибка удаления изображения ${key}:`, error);
        }
      }
    }

    const { error } = await supabaseDB
      .from(tableName)
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (error) throw error;

    //Обновляем список после удаления
    await loadServer();
    alert(
      `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Успешно удалён`
    );
  } catch (error) {
    console.error("Ошибка удаления:", error);
    alert(`Не удалось удалить услугу ${itemName}`);
  }
}
function extractKeyFromUrl(url, bucket) {
  try {
    if (!url.includes("http")) return url;
    //Удаляем возможные параметры запроса
    const cleanUrl = url.split("?")[0];

    //Разные варианты разделителей
    const patterns = [
      `/storage/v1/object/public/${bucket}/`,
      `/object/public/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
    ];
    for (const pattern of patterns) {
      if (cleanUrl.includes(pattern)) {
        return cleanUrl.split(pattern)[1];
      }
    }
    //Если не один паттерн не подошёл, попробуем извлечь последнюю часть URL
    const parts = cleanUrl.split("/");
    return parts[parts.length - 1];
  } catch (error) {
    console.error(`Error extracting key from URL:`, error);
    return url; //Возвращаем оригиеальный url
  }
}
