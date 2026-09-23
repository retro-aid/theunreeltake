"use server"

import { revalidatePath } from "next/cache";
import { updateTag } from "../dal/dto/tags"

export async function updateTagAction (
    id: number,
    displayName: string,
    type: string
) {
    try {
        await updateTag(id, displayName, type);
        revalidatePath("/dashboard/tags");
        return {
            error: null,
            success: true
        };
    } catch (error) {
        console.error("Gailed to update tag:", error);
    return {
        error: error,
        sucess: false
    };
    }
}