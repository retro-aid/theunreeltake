import type { ReactNode } from "react";
import { Alert, Paper, Text} from "@mantine/core";


interface AnalyticsCardProps {
    title: string;
    error?: string | null;
    empty?: boolean;
    children: ReactNode;
}

export function AnalyticsCard({ title, error, empty, children } : AnalyticsCardProps) {
    return(
        <Paper withBorder p="md" h="100%">
            <Text size="sm" c="dimmed" mb={4}> {title} </Text>

            {error ? (
                <Alert color="red" variant="light"> {error} </Alert>
            ):empty ? (
                <Text c="dimmed" size="sm"> No data for this period.</Text>
            ) : ( children)}
        </Paper>
    )
}

//Result of a GA call: the data, or an error message to show on the card
export type Loaded<T> =
    | {data: T; error: null}
    | {data: null; error: string };

//When runnings a GA Call it turns the thrown error into a value, 
//so it display the error onto the card instead of crashing the page.
export async function load<T>(fn: () => Promise<T>): Promise<Loaded<T>> {
    try {
        return { data: await fn(), error: null};
    } catch (e) {
        console.error(e);
        return { data: null, error: "Could not load this data."}
    }
}