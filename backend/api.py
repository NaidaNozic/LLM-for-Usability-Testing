from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import config
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

client = OpenAI(api_key=config.custom_api_key)

system_prompt = """You are a UX expert for web applications.
Your task is to identify usability issues with the
information you get for an application’s view.
An example of a usability issue could be: ‘Lack of
visual feedback on user interactions’.
Respond using app domain language; you must not use
technical terminology or mention code details.
Enumerate the problems identified; add an empty
paragraph after each enumeration; no preceding
or following text."""

@app.route('/detect-usability', methods=['POST'])
def detect_usability():
    try:
        data = request.json
        app_overview = data.get("app_overview", "")
        user_task = data.get("user_task", "")
        source_code = data.get("source_code", "")
        image_data = data.get("image", "")

        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        user_prompt = f"""I have a python web application written in Django about: {app_overview}
        The user’s task in this app view is about: {user_task}.
        An image of the app view is provided.
        Below is the incomplete code for the app view.
        This code includes the view’s user interface.
        Source Code:
        {source_code}"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_data}",
                            },
                        },
                    ],
                },
            ],
        )

        usability_issues = response.choices[0].message.content
        return jsonify({"usability_issues": usability_issues})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)