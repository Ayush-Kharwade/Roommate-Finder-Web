import ollama

def get_mistral_response(prompt):
    # This function uses the Ollama library to send a message to the 'mistral' model.
    try:
        response = ollama.chat(model='mistral', messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])
        return response['message']['content']
    except Exception as e:
        return f"An error occurred: {e}"

if __name__ == "__main__":
    test_prompt = "Hello, what can you do?"
    response = get_mistral_response(test_prompt)
    print(response)