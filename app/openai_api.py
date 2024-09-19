from openai import OpenAI


OPENAI_API_KEY="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"
MODEL="gpt-3.5-turbo-1106"


def create(system_message, prompt):
    client = OpenAI(api_key=OPENAI_API_KEY)

    resp = client.chat.completions.create(
      model = MODEL,
      response_format = {"type": "json_object"},
      messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": prompt}
      ],
      max_tokens = 4096,
      temperature = 0.8 
    )

    return resp.choices[0].message.content, resp.usage

