from flask import Flask, request, jsonify
from flask_cors import CORS
from explainer import explain_text

app = Flask(__name__)
CORS(app)

@app.route('/explain', methods=['POST'])
def explain():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    explanation = explain_text(text)
    return jsonify({"explanation": explanation})

if __name__ == '__main__':
    app.run(debug=True)
