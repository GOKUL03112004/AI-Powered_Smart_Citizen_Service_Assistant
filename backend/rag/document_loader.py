import logging
from pathlib import Path

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


class DocumentLoader:
    def __init__(self, data_dir: str = "./data") -> None:
        self._data_dir = Path(data_dir)
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", ".", " ", ""],
        )

    def load_all(self) -> list[Document]:
        documents: list[Document] = []
        for txt_file in self._data_dir.glob("*.txt"):
            try:
                loader = TextLoader(str(txt_file), encoding="utf-8")
                raw_docs = loader.load()
                for doc in raw_docs:
                    doc.metadata["source"] = txt_file.stem
                    doc.metadata["filename"] = txt_file.name
                chunks = self._splitter.split_documents(raw_docs)
                documents.extend(chunks)
                logger.info("Loaded %d chunks from %s", len(chunks), txt_file.name)
            except Exception as exc:
                logger.error("Failed to load %s: %s", txt_file, exc)
        return documents

    def load_text(self, text: str, source: str = "user_upload") -> list[Document]:
        doc = Document(page_content=text, metadata={"source": source})
        return self._splitter.split_documents([doc])
