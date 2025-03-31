// Example route to fetch question using `q`
import { NextResponse } from "next/server";
import { getQuestionByNum } from "@/utils/databaseQuery";

export async function GET(request: Request, context: { params: { sectionId?: string; questionNum?: string } }) {
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

        return NextResponse.json({ question });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching question data" }, { status: 500 });
    }
}
