"use server"

import { createPostTemplate, deletePostTemplate, getPostTemplates, updatePostTemplate } from "../dal/dto/templates"

export async function createPostTemplateAction(title: string, description: string, htmlContent: string, isPublic: boolean) {
    return createPostTemplate({title, description, htmlContent, isPublic})
}

export async function getPostTemplatesAction(Id?:string) {
    return getPostTemplates(Id)
}

export async function updatePostTemplateAction(id:string, title: string, description: string, htmlContent: string, isPublic: boolean){
    return updatePostTemplate({id, title, description, htmlContent, isPublic})
}

export async function deletePostTemplateAction(id:string) {
    return deletePostTemplate(id)
}