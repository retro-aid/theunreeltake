import { TemplateForm } from "@/app/ui/admin/forms/TemplateForm";
import prisma from "@/lib/prisma";
import {redirect} from "next/navigation";

export default async function EditTemplatePage({
    params
  }: {
    params: Promise<{ id: string }>
  }) {

  const { id } = await params;

  const data = await prisma.postTemplate.findUnique({
    where: { id: id },
  });

  if (!data) redirect("/dashboard/templates") 

  const template = {
    id: data.id,
    title: data.title,
    description: data.description,
    htmlContent: data.htmlContent,
    isPublic: data.isPublic
  }

  return (
    <div>
      <TemplateForm template={template}/>
    </div>
  )
}