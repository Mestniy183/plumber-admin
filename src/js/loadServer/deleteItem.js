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

    if (item.image && item.image_2x && item.image_3x) {
      const imagesComment = [item.image, item.image_2x, item.image_3x];

      for (const image of imagesComment) {
        const key = extractKeyFromUrl(image, "comment");

        const deleteParams = {
          Bucket: "comment",
          Key: key,
        };
        try {
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await client.send(deleteCommand);
        } catch (error) {
          console.error("Ошибка удаления картинки");
        }
      }
    }

    if (item.imageBefore && item.imageAfter) {
      const imagesExample = [item.imageBefore, item.imageAfter];

      for (const image of imagesExample) {
        const key = extractKeyFromUrl(image, "example");

        const deleteParams = {
          Bucket: "example",
          Key: key,
        };
        try {
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await client.send(deleteCommand);
        } catch (error) {
          console.error("Ошибка удаления картинки");
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
  return parts[1];
}
