import os
from dotenv import load_dotenv
from openai import OpenAI
import argparse
from config import system_prompt, execution_directive
from call_function import available_functions, call_function
import json


def main():
    
    parser = argparse.ArgumentParser(
            description="Chatbot")

    parser.add_argument(
            "user_prompt",
            type=str,
            help="User prompt")

    parser.add_argument(
            "--verbose",
            action="store_true",
            help="Enable verbose output"
            )

    parser.add_argument(
            "--openrouter",
            action="store_true",
            help="Swicth to the Openrouter API instead of the default Groq one"
            )

    args = parser.parse_args()
    

    load_dotenv()
    if args.openrouter:
        api_key = os.environ.get("OPENROUTER_API_KEY")
        base_url = "https://openrouter.ai/api/v1"
        model = "openrouter/free"
    else:
        api_key = os.environ.get("GROQ_API_KEY")
        base_url = "https://api.groq.com/openai/v1"
        model = "openai/gpt-oss-20b"
    
    if not api_key:
        raise RuntimeError("ai api key not found on the .env file")

    client = OpenAI(
        base_url=base_url,
        api_key=api_key,
    )

    user_prompt = args.user_prompt
    
    messages=[
            {
                "role": "system",
                "content": system_prompt + execution_directive
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
    
    for _ in range(20):
        response = client.chat.completions.create(
                model=model,
                messages=messages,
                tools=available_functions,
                )
        message = response.choices[0].message
        messages.append(message.model_dump(exclude_none=True))
        
        if response.usage == None:
            raise RuntimeError("api request failed")


        if args.verbose:
            print(f"User prompt: {user_prompt}")
            print(f"Prompt tokens: {response.usage.prompt_tokens}")
            print(f"Response tokens: {response.usage.completion_tokens}")


        if message.tool_calls:
            for tool_call in message.tool_calls:
                function_args = json.loads(tool_call.function.arguments or "{}")
                print(f"Calling function: {tool_call.function.name}({function_args})")
                result_message = call_function(tool_call, args.verbose)

                if not result_message["content"]:
                    raise Exception("received empty string from the function")
                
                messages.append(result_message)

        else:
            print(f"Response:\n {response.choices[0].message.content}")
            return
    
    print("maximum number of iterations is reached and the model still hasn't produced a final response")
    exit(1)


if __name__ == "__main__":
    main()
