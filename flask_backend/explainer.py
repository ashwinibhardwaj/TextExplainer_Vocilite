from langchain_groq import ChatGroq
from langchain.schema import HumanMessage
import os
import re
from dotenv import load_dotenv

load_dotenv()

def clean_text_for_tts(text):
    """
    Removes markdown, HTML, and formatting symbols from LLM output,
    producing plain text suitable for TTS.
    """
    # Remove markdown bold/italic/code
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'`(.*?)`', r'\1', text)

    # Remove markdown bullet points or list markers
    text = re.sub(r'^\s*[-*]\s+', '', text, flags=re.MULTILINE)

    # Remove markdown headings (e.g. ### Heading)
    text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)

    # Remove HTML tags if any
    text = re.sub(r'<[^>]+>', '', text)

    # Remove extra spaces and newlines
    text = re.sub(r'\s+', ' ', text).strip()

    return text

def explain_text(text):
    chat = ChatGroq(
        temperature=0.5,
        model="llama3-70b-8192",
        api_key=os.getenv("GROQ_API_KEY")
    )
    prompt = f"""
        You are an expert teacher skilled at explaining concepts clearly and simply.

        - Explain the following text in a way a high school student could easily understand.
        - Keep your explanation concise and focused.
        - Do not add unrelated information beyond what is necessary to explain the text.
        - If the text is very short (a phrase or single sentence), keep your explanation brief (2-3 sentences maximum).
        - If the text contains technical or complex terms, define them simply.
        - Avoid long paragraphs.
        - Write your explanation as plain text without using markdown symbols, lists, bullet points, or special formatting characters.

        Here is the text to explain:

        {text}
    """

    response = chat([HumanMessage(content=prompt)])
    cleaned_text = clean_text_for_tts(response.content)
    return cleaned_text
