from transformers import pipeline
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

# Load a pre-trained question answering model
question_answerer = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

# Initialize NLTK resources
stop_words = set(stopwords.words("english"))
stemmer = PorterStemmer()


def load_knowledge_base(file_path):
    """Loads the knowledge base from a text file."""
    knowledge_base = {}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                question, answer = line.strip().split("|", 1)
                knowledge_base[question] = answer
    except FileNotFoundError:
        print(f"Error: Knowledge base file not found at {file_path}")
        return {}
    except ValueError:
        print(f"Error: Invalid format in knowledge base file.  Each line should be 'question|answer'")
        return {}
    return knowledge_base


def preprocess_text(text):
    """Preprocesses text by tokenizing, removing stop words, and stemming."""
    word_tokens = word_tokenize(text.lower())  # Tokenize and lowercase
    filtered_words = [
        stemmer.stem(word)
        for word in word_tokens
        if word not in stop_words and word.isalnum() # Remove stop words and punctuation
    ]
    return filtered_words


def find_best_match(question, knowledge_base):
    """Finds the best matching answer in the knowledge base based on preprocessed keywords."""
    question_keywords = preprocess_text(question)
    best_match = None
    max_keyword_matches = 0

    for kb_question, kb_answer in knowledge_base.items():
        kb_question_keywords = preprocess_text(kb_question)
        keyword_matches = sum(1 for keyword in question_keywords if keyword in kb_question_keywords)

        if keyword_matches > max_keyword_matches:
            max_keyword_matches = keyword_matches
            best_match = kb_answer

    return best_match


def answer_question(question, knowledge_base):
    """Answers a question using the knowledge base and the question answering model."""
    best_match = find_best_match(question, knowledge_base)

    if best_match:
        return best_match  # Return the direct answer
    else:
        return "I don't have information on that question."


if __name__ == "__main__":
    # Example usage (only runs when this file is executed directly)
    knowledge_base = load_knowledge_base("knowledge_base.txt")  # Load the knowledge base
    if knowledge_base:
        question = "What is pythagorean theorem?"
        answer = answer_question(question, knowledge_base)
        print(f"Question: {question}")
        print(f"Answer: {answer}")