from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA

app = FastAPI("Exam Hub API")

app.add_mddleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

embeddings = HuggingFaceBgeEmbeddings(model_name="BAAI/bge-m3")
vector_db = Chroma(persist_directory="./uace_db", embedding_function=embeddings)
llm = Ollama(model="deepseek-r1:7b")

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever = vector_db.as_retriever(search_kwargs={"k": 3})
)

class StudentQuery(BaseModel):
    question: str

@app.post("/ask")
async def ask_tutor(query: StudentQuery):
    result = qa_chain.invoke(query.question)
    return {
        "question": query.question,
        "answer": result["result"]
    }
    