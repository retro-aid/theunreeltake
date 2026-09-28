"use server"

import { getTags } from "../dal/dto/catalog"

export async function getTagsAction(){
    return getTags();
}