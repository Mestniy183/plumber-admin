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
      if (key.includes("image") && item[key]) {
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
          console.log(`Удалено изображение: ${imageUrl}`);
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
  const parts = url.split(`/object/public/${bucket}/`);
  return parts[1] || url;
}
