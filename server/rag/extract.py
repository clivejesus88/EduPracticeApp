import os
import numpy as np
import easyocr
from pdf2image import convert_from_path

def extract_with_easyocr(pdf_path, output_path):
    # --- STEP A: VERIFY PATH ---
    # Double-check this path. Ensure there are no extra spaces.
    POPPLER_PATH = r"C:\poppler-24.08.0\Library\bin"
    
    print(f"Checking for Poppler at: {POPPLER_PATH}")
    if not os.path.exists(POPPLER_PATH):
        print("❌ ERROR: The folder path does not exist. Check the folder name again.")
        return
    
    if not os.path.exists(os.path.join(POPPLER_PATH, "pdfinfo.exe")):
        print("❌ ERROR: Folder found, but 'pdfinfo.exe' is missing inside it!")
        return

    # --- STEP B: CONVERSION ---
    print("🎨 Converting PDF to images (this may take a moment)...")
    try:
        pages = convert_from_path(pdf_path, 300, poppler_path=POPPLER_PATH)
    except Exception as e:
        print(f"❌ Poppler crashed: {e}")
        return

    # --- STEP C: OCR ---
    print("🧠 Initializing EasyOCR...")
    reader = easyocr.Reader(['en'], gpu=False) 
    
    full_text = []
    for i, page in enumerate(pages):
        print(f"🔍 OCR-ing Page {i+1}...")
        img_array = np.array(page)
        results = reader.readtext(img_array, detail=0)
        full_text.append(f"--- Page {i+1} ---\n" + "\n".join(results))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(full_text))
    
    print(f"✅ Success! Saved to {output_path}")

extract_with_easyocr("rag/physics.pdf", "rag/output/physics/physics.md")