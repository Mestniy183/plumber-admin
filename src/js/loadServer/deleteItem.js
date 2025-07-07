import { supabaseDB } from "../api.js";
import { getUser } from "../checkAuth.js";
import { loadServer } from "./loadServer.js";

export async function deleteItem(itemId, tableName, itemName){
    try {

        if(!confirm(`Вы уверены, что хотите удалить этот ${itemName}?`)){
            return;
        }

        const user = await getUser()

        const{error} = await supabaseDB
        .from(tableName)
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

        if(error) throw error;

        //Обновляем список после удаления
        await loadServer();
        alert(`${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Успешно удалён`);

    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert(`Не удалось удалить услугу ${itemName}`);
    }
}