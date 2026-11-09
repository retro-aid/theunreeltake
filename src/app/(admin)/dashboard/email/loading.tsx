'use client';

import { Paper, Table, Skeleton, Box, Group } from '@mantine/core';

/**
 * Implements streaming so it shows the skeleton while it gets the data from resend
 */
export default function Loading() {
  return (
    <Box
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 4rem)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
      }}
    >
      <Paper
        withBorder
        radius="md"
        p="md"
        bg="white"
        shadow="xs"
        style={{
          width: '100%',
          maxWidth: '1000px',
        }}
      >
        {/* Header Skeleton */}
        <Group justify="space-between" align="center" mb="md">
          <div>
            <Skeleton height={24} width={130} radius="sm" mb={6} />
            <Skeleton height={12} width={260} radius="sm" />
          </div>
          {/* Skeleton for the '+' action icon */}
          <Skeleton height={36} width={36} radius="sm" />
        </Group>

        {/* Table Skeletons (6 columns matching First Name, Last Name, Email, Date, Status, Actions) */}
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>First Name</Table.Th>
              <Table.Th>Last Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Date Subscribed</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <Table.Tr key={index}>
                <Table.Td><Skeleton height={16} width={90} radius="sm" /></Table.Td>
                <Table.Td><Skeleton height={16} width={100} radius="sm" /></Table.Td>
                <Table.Td><Skeleton height={16} width={200} radius="sm" /></Table.Td>
                <Table.Td><Skeleton height={16} width={110} radius="sm" /></Table.Td>
                <Table.Td><Skeleton height={20} width={65} radius="sm" /></Table.Td>
                <Table.Td><Skeleton height={28} width={28} radius="sm" /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {/* Pagination buttons skeleton */}
        <Group justify="flex-end" mt="md" gap="xs">
          <Skeleton height={26} width={65} radius="sm" />
          <Skeleton height={26} width={50} radius="sm" />
        </Group>
      </Paper>
    </Box>
  );
}