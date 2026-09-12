"use client";

import {Box, Title, Text, Button, Paper, Stack, Group, Pagination, ActionIcon, Flex, Modal, TextInput,Textarea} from "@mantine/core"
import { useDisclosure } from '@mantine/hooks';
import {useState, useEffect, useTransition, useCallback} from "react"
import GridReview from "./gridReview";
import Link from "next/link"
import { getMediaRequests,replyToRequest } from "@/lib/actions";
import {HomeSearchBar} from "@/app/ui/home/HomeSearchBar";
import RequestActionButtons from "@/app/ui/admin/RequestActionButtons";
import RefreshDataButton from "@/app/ui/home/RefreshDataButton";
import {Request} from "@/generated/prisma/client";

const limit = 10;

export default function DashboardRequestsPage() {

	const [selectedId, setSelectedId] = useState<string | undefined>();
	const [requests, setRequests] = useState<Request[]>([]);
	const selectedItem = requests.find((item) => item.id === selectedId);
	const [page, setPage] = useState(1);
	const [type, setType] = useState("");
	const [sort, setSort] = useState("");
	const [search, setSearch] = useState("");
	const [total, setTotal] = useState(0);
	const [deleteOpened, { open:openDelete, close: closeDelete }] = useDisclosure(false);
	const [replyOpened, { open:openReply, close: closeReply }] = useDisclosure(false);
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);

	const [isLoading, startTransition] = useTransition();

	const handleSearch = (value: string) => {
		setSearch(value);
		setPage(1);
		setSelectedId(undefined);
	}

	const handleFilter = (value: string) => {
		setType(value);
		setPage(1);
		setSelectedId(undefined);
	};

	const handleSort = (value: string) => {
		setSort(value);
		setPage(1);
		setSelectedId(undefined);
	};

	const handleDelete = async () => {
    	await fetch(`/api/requests/${selectedItem?.id}`, { method: 'DELETE' });
    	close();
  	};

	const handleSend = async () => {
  		if (!selectedItem || !message.trim()) return;
  		setSending(true);
 	 	try {
    		await replyToRequest(selectedItem.id, message);
    		close();
    		setMessage('');
  		} catch (error) {
    	console.error('Send failed:', error);
  		} finally {
    	setSending(false);
 	 	}
	};

	const refresh = useCallback(() => {
		startTransition(async () => {
			const res = await getMediaRequests({ page, limit, search, type, sort });
			if (res.success) {
				setRequests(res.data);
				setTotal(Math.ceil(res.total / limit));
			}
		});
	}, [page, search, type, sort]);

	useEffect(() => {
		refresh();
	}, [refresh]);
	
	return(
		<Box p="lg">
			<Title order={2} mb="md">
					Requests
			</Title>
			<Paper withBorder radius="md" p="lg" mb="lg">
				{selectedItem ? (
				<Stack>
					<Title order={4}>{"Selected: " + selectedItem.title}</Title>
					<Text size="sm" c="dimmed">
						{selectedItem.message}
					</Text>
					<Group>
					<Button size="xs" variant="light" component= {Link} 
						href={{
							pathname: "/dashboard/posts/create",
							query: {
								title: selectedItem.title,
								message: selectedItem.message ?? "",
								type: selectedItem.type ?? "",
							},
						}}>
						Create Post
					</Button>

					<Modal opened={replyOpened} onClose={closeReply} title={`Reply to ${selectedItem.name ?? selectedItem.email}`} centered>
						<Stack>
							<TextInput label="To" value={selectedItem.email} disabled />
							<Textarea
								label="Your response"
								placeholder="Type your reply..."
								value={message}
								onChange={(e) => setMessage(e.currentTarget.value)}
								minRows={5}
								autosize
							/>
							<Group justify="flex-end">
								<Button variant="default" onClick={close}>Cancel</Button>
								<Button onClick={handleSend} loading={sending} disabled={!message.trim()}>
									Send
								</Button>
							</Group>
						</Stack>
					</Modal>

					<Button size="xs" variant="light" onClick={openReply}>
						Reply To User
					</Button>


					<Modal opened={deleteOpened} onClose={closeDelete} title="Delete Request" centered>
        				<Text size="sm">
         					 Are you sure you want to delete this request?
        				</Text>

       					<Group justify="flex-end" mt="md">
          					<Button variant="default" onClick={close}>
            					Cancel
          					</Button>
          					<Button color="red" onClick={handleDelete}>
           						 Delete
          					</Button>
       					</Group>
      				</Modal>

					<Button size="xs" variant="light" color="red" onClick={openDelete}>
						Delete Request
					</Button>
					</Group>
				</Stack>
				) : (
				<Text c="dimmed"> Select a card to view details </Text>
				)}
			</Paper>


			<Group mb="md">
				<Flex miw={500}>
				<HomeSearchBar onSearchAction={handleSearch} />
				</Flex>
				<RequestActionButtons
				onSortByAction={handleSort}
				onFilterByTypeAction={handleFilter}
				/>
				<RefreshDataButton updateData={refresh} />
			</Group>

			{!isLoading ?
				<>
					<GridReview
						data={requests}
						selectedId={selectedId}
						onSelectAction={(id) => setSelectedId(id)}
					/>
					<Group mt="xl">
						<Pagination total={total}
						value={page}
						onChange={(p) => { setPage(p); setSelectedId(undefined); }}
					/>
					</Group>
				</>
				: null
			}

		</Box>
	)

    
}
