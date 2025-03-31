"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

// page that redirects to specific question based on type and question number
const SectionPage = () => {

    // not sure what this does 
    const params = useParams(); 
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params || !params.sectionId) return; 

        const fetchData = async () => {
            try {

                // updates the database w/ new user using file "../api/section/[sectionId]/route.ts"
                const res = await fetch(`/api/section/${params.sectionId}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error);

                const { question } = data;
                if (!question) throw new Error("No valid question found.");

                // once found, send user to question
                console.log(question)
                router.push(`/sections/${params.sectionId}/${question.type}?q=${question.question_num}`);
            } catch (error) {
                console.error("Error fetching section data:", error);
            } finally {
                setLoading(false);
            }
        };

        // call declared function
        fetchData();
    }, [params, router]);

    // html to show redirection processing
    if (loading) return <p>Loading...</p>;

    return <p>Redirecting...</p>;
};

export default SectionPage;
