"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params?.id as string;

    useEffect(() => {
        // Redirect to tasks page
        if (projectId) {
            router.replace(`/dashboard/project/${projectId}/tasks`);
        }
    }, [projectId, router]);

    return (
        <Center h="100vh">
            <Loader color="#1e3a5f" />
        </Center>
    );
}
