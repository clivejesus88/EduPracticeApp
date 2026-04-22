from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import os

# 1. Setup Embeddings
print("🧬 Loading Embedding Model...")
embeddings = HuggingFaceBgeEmbeddings(model_name="BAAI/bge-m3")

# 2. Load the OCR text
file_path = "./rag/output/physics/physics.md"
with open(file_path, "r", encoding="utf-8") as f:
    raw_text = f.read()

# 3. Chunking with Physics-friendly settings
# We use a 1000 character chunk to keep the definition + formula together
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, 
    chunk_overlap=150,
    separators=["--- Page", "\n\n", "\n", " ", ""]
)

docs = text_splitter.create_documents([raw_text])
print(f"✂️ Created {len(docs)} text chunks.")

# 4. Create the Local Database
# This will save in the 'uace_db' folder
print("💾 Saving to Vector Database...")
vector_db = Chroma.from_documents(
    documents=docs, 
    embedding=embeddings, 
    persist_directory="./uace_db"
)

print("✅ Database is ready!")