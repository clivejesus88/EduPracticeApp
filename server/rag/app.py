from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.llms import Ollama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate


template = """Use the following pieces of context from UACE Past Papers to answer the question at the end. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Follow UNEB marking style: State the law, show the formula, and include units.

{context}

Question: {question}
Helpful Answer:"""

QA_CHAIN_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template=template,
)

# 1. Setup Embeddings (The "Librarian")
# BGE-M3 is excellent for Science/Math text
embeddings = HuggingFaceBgeEmbeddings(model_name="BAAI/bge-m3")

# 2. Load and Chunk your extracted Markdown
# We use a larger chunk size to keep Math context together
with open("./output/uace_physics_2022.md", "r") as f:
    text = f.read()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
docs = text_splitter.create_documents([text])

# 3. Create the Local Database (The "Shelves")
vector_db = Chroma(
    persist_directory="./uace_db", 
    embedding_function=embeddings
)
# 4. Initialize the Tutor (The "Brain")
llm = Ollama(model="deepseek-r1:7b")

# 5. The Q&A Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_db.as_retriever(search_kwargs={"k": 3}),
    chain_type_kwargs={"prompt": QA_CHAIN_PROMPT} # This connects your custom prompt
)
# Test it!
question = "How do I calculate the force on a wire in a magnetic field?"
response = qa_chain.invoke(question)
print(response["result"])