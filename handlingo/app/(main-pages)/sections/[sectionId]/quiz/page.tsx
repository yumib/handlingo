"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Layout from '@/components/ui/layout'; 
// import MultipleChoice from "@/components/client/multipleChoice";


const QuestionPage = () => {

  //not sure what this does
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // set up structure of question
  type Question = {
    title: string;
    header: string;
    correct_answer: string;
    options:string[];
  };
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [pointsAwarded, setPointsAwarded]= useState(false);
  // keeps track of what question the user is on by parsing the url
  const questionNumber = parseInt(searchParams.get("q") || "1", 10);

  useEffect(() => {
    if (!params.sectionId) return;

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

  const handleAnswer= async (answer: string) =>{
    if(!question || pointsAwarded)
      {
        return;
      }
      setSelectedAnswer(answer);
  
    if(answer === question.correct_answer)
      {
        setFeedback("Thats Correct!");
          if(questionNumber===5 && !pointsAwarded){
        try{
          const result = await fetch("/api/points",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 5 }) // the points we're giving in this section(5 points for getting a question right)
          
        });
          if(!result.ok)
          {
            const error = await result.json();
            console.error("Failed to give points: ",error);
          }
          else
          {
            console.log("Points given at the end of the lesson");
            setPointsAwarded(true);
          }
        }
      
        catch(error)
        {
          console.error("Error updating points/score")
        }
        
          }
        }
      else
      {
        setFeedback("Thats wrong. Try again.")
      }
  };

  return (
    // display data
    <Layout>
    <div>
      <h1>{question.title}</h1>
      <p>{question.header}</p>
      {/* <MultipleChoice
          choices={question.options}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
        /> */}
      <p>FeedBack:{feedback}</p>
      <p>Correct Answer: {question.correct_answer}</p>
    </div>
    </Layout>
  );
};

export default QuestionPage;
