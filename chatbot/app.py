from flask import Flask, render_template, request
import qa_module

app = Flask(__name__)

# Load the knowledge base (do this only once when the app starts)
knowledge_base = qa_module.load_knowledge_base("knowledge_base.txt")

@app.route("/")
def index():
    """Renders the main page with the chatbot interface."""
    return render_template("index.html")

@app.route("/get_answer", methods=["POST"])
def get_answer():
    """Handles the user's question and returns the answer."""
    question = request.form["question"]
    if knowledge_base:
        answer = qa_module.answer_question(question, knowledge_base)
    else:
        answer = "Error: Knowledge base not loaded."

    return answer

if __name__ == "__main__":
    app.run(debug=True)