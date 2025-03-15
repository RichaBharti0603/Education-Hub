# main.py
import qa_module

# Load the knowledge base
knowledge_base = qa_module.load_knowledge_base("knowledge_base.txt")

if knowledge_base: #Only proceed if the knowledge base loaded successfully
    while True:  # Keep asking questions until the user quits
        question = input("Enter your question (or type 'quit' to exit): ")
        if question.lower() == "quit":
            break  # Exit the loop

        answer = qa_module.answer_question(question, knowledge_base)
        print(f"Answer: {answer}")
else:
    print("Knowledge base could not be loaded.  Exiting.")