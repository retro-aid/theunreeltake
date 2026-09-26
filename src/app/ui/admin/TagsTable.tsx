"use client";

import {Tag} from "@/generated/prisma/client";
import {ActionIcon, Button, Group, Modal, Table, TableData, Title, Text, Stack, TextInput, MenuLabel, Select} from "@mantine/core";
import {Trash, PencilSquare, Floppy} from "react-bootstrap-icons";
import {deleteTag} from "@/lib/actions";
import {useDisclosure} from "@mantine/hooks";
import {useState} from "react";
import { updateTagAction } from "@/lib/actions/tag-actions";
import { AllowedTagType } from "@/lib/constants";

export default function TagsTable(
  { data }: { data: Tag[] }
) {

  const [opened, { open, close }] = useDisclosure();
  const [selectedTagId, setSelectedTagId] = useState(0);
  const [editTag, setEditTag] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const tagTypeOptions = [AllowedTagType.Category, AllowedTagType.Media, AllowedTagType.Informational];

  const handleEdit = (tag: Tag) => {
    setEditTag(tag.id);
    setEditName(tag.displayName);
    setEditType(tag.type);
  }

  const handleSave = async (id: number) => {
    const { error, success } = await updateTagAction(id, editName, editType);
    if (!success) {
      console.log(error);
      return;
    }
    
    setEditTag(null);
    setEditName("");
    setEditType("");
  }

  const handleDelete = async (id: number) => {

    const {error, success} = await deleteTag(id);

    if(!success) {
      console.log(error);
    }
  }

  const tableData: TableData = {
    head: ["ID", "Name", "Type", "Actions"],
    body: data.map((tag) => {

      const isEditing = editTag === tag.id;
      const nameColumn = isEditing ? (<TextInput value={editName} onChange={(event) => setEditName(event.currentTarget.value)}></TextInput>) : (tag.displayName);
      const typeColumn = isEditing ? (<Select value={editType} onChange={(value) => setEditType(value ?? "")} data={tagTypeOptions} allowDeselect={false}></Select>) : (tag.type);

      const actionButtons = (
        <Group>
          {isEditing ? (<ActionIcon color="green" onClick={() => handleSave(tag.id)}><Floppy></Floppy></ActionIcon>)
                     : (<ActionIcon color="blue" onClick={() => handleEdit(tag)}><PencilSquare></PencilSquare></ActionIcon>)}
          <ActionIcon color={"red.8"} onClick={() => { open(); setSelectedTagId(tag.id) }}>
            <Trash/>
          </ActionIcon>
        </Group>
      );

      return [tag.id.toString(), nameColumn, typeColumn, actionButtons];
    })
  }

  return (
    <>
      <Modal
        title={
          <Stack gap={0}>
            <Title order={4}>Are you sure you want to delete this tag?</Title>
            <Text size={"sm"}>This action cannot be undone.</Text>
          </Stack>
        }
        opened={opened}
        onClose={close}
      >

        <Group justify="center">
          <Button color="red" onClick={async () => {
            close();
            await handleDelete(selectedTagId);
          }}>
            Yes, Delete
          </Button>

          <Button variant="default" onClick={close}>
            No, Keep
          </Button>
        </Group>
      </Modal>

      <Table
        data={tableData}
        withRowBorders
        highlightOnHover
      />
    </>
  );
}