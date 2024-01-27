/**
 * ref:
 * 1. https://cookbook.openai.com/examples/how_to_call_functions_with_chat_models
 * 2. https://github.com/atinylittleshell/function-gpt
 * 3. https://github.com/openai/openai-node/blob/master/README.md
 */
import OpenAI from "openai";
import { provider } from "./WeatherTools";

import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "openai/resources";

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
});

async function agent() {
  /** deprecated API fields */
  const functions = await provider.getSchema();
  /** new API fields */
  const tools: ChatCompletionTool[] = functions.map((func) => {
    return {
      type: "function",
      function: func,
    };
  });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: "What's the weather like in San Francisco, Tokyo, and Paris?",
    },
  ];

  const model = "gpt-3.5-turbo-1106";

  const response = await openai.chat.completions.create({
    messages,
    model, //"gpt-3.5-turbo",
    tools: tools,
    //     tool_choice="auto",  # auto is default, but we'll be explicit
  });

  // gpt-3.5-turbo-1106 would return tool_calls with length 3
  // but "gpt-3.5-turbo" only return tool_calls with length 1 (only one location)
  console.log(response.choices);

  const response_message = response.choices[0].message;
  messages.push(response_message);

  const { tool_calls } = response_message;
  if (tool_calls) {
    for (const tool_call of tool_calls) {
      const { name, arguments: argumentsJsonStr } = tool_call.function;

      /** pros: auto select, cons: no return type */
      const function_response = (await provider.handleFunctionCalling(
        name,
        argumentsJsonStr,
      )) as string;
      /** pros: infer return type. cons: manually select */
      // const function_response2 = await provider.get_current_weather(
      //   JSON.parse(argumentsJsonStr),
      // );
      // console.debug({ function_response2 });

      const newMessage: ChatCompletionToolMessageParam = {
        tool_call_id: tool_call.id,
        role: "tool",
        content: function_response,
      };

      messages.push(newMessage);
    }
  }

  const second_response = await openai.chat.completions.create({
    /** user, assistant, tool, tool, tool  */
    messages,
    model,
  });
  /* role: assistant, 
     content: 
     "Currently, the weather is as follows:\n\n- San Francisco: The temperature is 72°C.\n- Tokyo: The temperature is 10°C.\n- Paris: The temperature is 22°C."
  */
  console.debug({ second_response });
}

agent();
