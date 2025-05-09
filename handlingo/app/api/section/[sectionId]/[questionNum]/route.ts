// Example route to fetch question using `q`
import { NextResponse } from "next/server";
import { getQuestionByNum, getQuestionsForSection } from "@/utils/databaseQuery";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request, context: { params: { sectionId?: string; questionNum?: string } }) {

    // find auth user
    const supabase = await createClient(); 
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Error getting user' }, { status: 400 });
    }

    // get parameters from url
    let { params } = context;
    params = await params
    if (!params) {
        return NextResponse.json({ error: "Missing sectionId parameter" }, { status: 400 });
    }

    // convert section id and question number into int for queries
    const sectionId = Number(params.sectionId);
    const questionNumber = Number(params.questionNum);

    if (!questionNumber || !sectionId) {
        return NextResponse.json({ error: "Missing question num or section id" }, { status: 400 });
    }

    try {

        // get question data  w/ questionNumber and sectionId from db queries on './utils/databaseQuery.ts'
        const question = await getQuestionByNum(questionNumber, sectionId);

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        const allQuestions = await getQuestionsForSection(sectionId);
        const totalQuestions = allQuestions.length;
    
        return NextResponse.json({ question, total_questions: totalQuestions });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching question data" }, { status: 500 });
    }
}
