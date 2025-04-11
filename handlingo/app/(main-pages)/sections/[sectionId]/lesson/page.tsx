"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Layout from '@/components/ui/layout'; 


const QuestionPage = () => {

  // not sure what this does
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // set up structure of question
  type Question = {
    title: string;
    header: string;
    description: string;
    correct_answer: string;
  };
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.sectionId) return;

    // get question number from URL query
    const questionNumber = searchParams.get("q");

    // fetch the question data from API
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/section/${params.sectionId}/${questionNumber}`);
        const data = await res.json();
        console.log(data)
        if (!res.ok) throw new Error(data.error);

        setQuestion(data.question); // assuming the API returns { question: { ... } }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [params.sectionId, searchParams]);

  if (loading) return <p>Loading question...</p>;
  if (!question) return <p>Question not found.</p>;

  return (
    // display data
    <Layout>
    <div>
      <h1>{question.title}</h1>
      <p>{question.header}</p>
      <p>{question.description}</p>
      <p>{question.correct_answer}</p>
    </div>
    </Layout>
  );
};

export default QuestionPage;
