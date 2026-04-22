from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

# 1. Load the DB
embeddings = HuggingFaceBgeEmbeddings(model_name="BAAI/bge-m3")
db = Chroma(persist_directory="./uace_db", embedding_function=embeddings)

# 2. Search for a specific concept from the 2022 paper
query = "What is the definition of magnetic flux?"
docs = db.similarity_search(query, k=2)

print("\n--- Top Results found in DB ---")
for i, doc in enumerate(docs):
    print(f"\nResult {i+1}:")
    print(doc.page_content)