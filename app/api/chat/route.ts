/* eslint-disable */
"use server";

import { StreamingTextResponse } from "ai";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // or hardcode for testing
});

export async function POST(req: Request) {
  try {
    // Default to GPT-3.5 (change to GPT-4 if you have access)
    const { messages, model = "gpt-3.5-turbo" } = await req.json();
    console.log("💬 Chat messages:", messages);
    console.log("🧠 Model used:", model);

    // 1) Get a streaming response from OpenAI
    const response: any = await openai.chat.completions.create({
      model,
      stream: true,
      messages,
    });
    console.log("🔧 Raw response from OpenAI:", response);

    // 2) Build a manual ReadableStream that only emits `chunk.choices[0].delta.content`
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response.iterator()) {
            // Each chunk is an object like:
            // {
            //   id: "...",
            //   object: "chat.completion.chunk",
            //   created: 1688541337,
            //   model: "gpt-3.5-turbo-0613",
            //   choices: [
            //     {
            //       delta: { content: "Hello world" },
            //       finish_reason: null,
            //       index: 0
            //     }
            //   ]
            // }
            // We only want the actual text from `delta.content`
            if (
              chunk?.choices &&
              chunk.choices[0]?.delta?.content
            ) {
              const text = chunk.choices[0].delta.content;
              // Convert the text into a Uint8Array for the stream
              const encoded = new TextEncoder().encode(text);
              controller.enqueue(encoded);
            }
            // If there's no content, skip it (it might be a role or finish_reason chunk).
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    // 3) Wrap our ReadableStream in a StreamingTextResponse
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error("❌ API ERROR:", err);
    if (err instanceof Error) {
      return new Response("Internal Error: " + err.message, { status: 500 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}