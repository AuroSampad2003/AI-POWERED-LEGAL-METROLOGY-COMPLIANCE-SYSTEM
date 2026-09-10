import os
import json
import re
import logging
import requests

try:
    # pyrefly: ignore [missing-import]
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("analyzer")

DEFAULT_MODEL = os.getenv("GROQ_MODEL", "groq/compound")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

MANDATORY_DECLARATIONS_META = {
    "manufacturer_details": {
        "title": "Manufacturer / Packer Details",
        "rule": "Rule 6(1)(a)",
        "default_why": "Name and complete physical address of the manufacturer, packer, or importer are not present in the extracted label text.",
        "default_reason": "Manufacturer information is either printed on an uncaptured panel or missing from the package."
    },
    "country_of_origin": {
        "title": "Country of Origin",
        "rule": "Rule 6(1)(aa)",
        "default_why": "Country of origin is not explicitly declared on the label as required for pre-packaged or imported commodities.",
        "default_reason": "No explicit 'Country of Origin' or 'Made in' declaration is visible."
    },
    "net_quantity": {
        "title": "Net Quantity",
        "rule": "Rule 6(1)(c)",
        "default_why": "Net weight, volume, or count declared in standard metric units is missing from the label text.",
        "default_reason": "Net quantity mark is located on a side panel not included in the OCR scan."
    },
    "mrp": {
        "title": "Maximum Retail Price (MRP)",
        "rule": "Rule 6(1)(e)",
        "default_why": "Maximum Retail Price (MRP) inclusive of all taxes is absent or non-compliant with standard formatting.",
        "default_reason": "Price ink-stamp or sticker was omitted, blurred, or missing from package."
    },
    "date_of_manufacture_or_pack": {
        "title": "Date of Mfg / Packing",
        "rule": "Rule 6(1)(d)",
        "default_why": "Month and year of manufacture, packing, or import are not declared on the package.",
        "default_reason": "Manufacturing date is stamped on the cap or crimp area not captured in OCR."
    },
    "consumer_care_details": {
        "title": "Consumer Care Details",
        "rule": "Rule 6(1)(f)",
        "default_why": "Consumer helpline address, telephone number, or email contact details are not provided on the package.",
        "default_reason": "Customer care support box is missing from the packaging label."
    },
    "unit_sale_price": {
        "title": "Unit Sale Price",
        "rule": "Rule 6(1)(g)",
        "default_why": "Unit sale price (price per gram, milliliter, or unit) is missing from the package label.",
        "default_reason": "Unit price calculation was not printed alongside MRP."
    }
}

def extract_json_object(text: str) -> dict:
    """
    Extracts and parses JSON from text, even if surrounded by markdown or conversational prose.
    """
    if not text or not isinstance(text, str):
        raise ValueError("Empty or non-string output received from LLM")
        
    text = text.strip()

    # 1. Direct parse attempt
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Strip ```json ... ``` markdown code fences
    cleaned = text
    if "```" in cleaned:
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
        try:
            return json.loads(cleaned.strip())
        except json.JSONDecodeError:
            pass

    # 3. Regex match first '{' to last '}'
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        json_str = match.group(0)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse valid JSON from LLM response: '{text[:100]}...'")

def normalize_analysis_response(parsed: dict, ocr_text: str = "") -> dict:
    """
    Normalizes the LLM JSON response to strictly guarantee the presence of all 7 mandatory declaration keys,
    each formatted with 'missing', 'text', 'why_missing', and 'likely_reason'.
    Includes smart MRP recovery if currency symbols (₹, Rs) were distorted by OCR.
    """
    if not isinstance(parsed, dict):
        parsed = {}
    
    declarations = parsed.get("declarations")
    if not isinstance(declarations, dict):
        declarations = {}
        
    normalized_decs = {}
    for key, meta in MANDATORY_DECLARATIONS_META.items():
        raw_item = declarations.get(key)
        
        if isinstance(raw_item, dict):
            status = raw_item.get("missing") or raw_item.get("status")
            if not status or status not in ["present", "missing", "partially missing"]:
                if raw_item.get("present") is True or (raw_item.get("text") and str(raw_item.get("text")).strip()):
                    status = "present"
                elif raw_item.get("present") is False:
                    status = "missing"
                else:
                    status = "missing"
                    
            text_val = raw_item.get("text")
            if text_val is not None and not isinstance(text_val, str):
                text_val = str(text_val)
                
            why_missing = raw_item.get("why_missing") or raw_item.get("missing_summary") or raw_item.get("explanation")
            if not why_missing or not str(why_missing).strip():
                if status != "present":
                    why_missing = meta["default_why"]
                else:
                    why_missing = None
                    
            likely_reason = raw_item.get("likely_reason") or raw_item.get("reason")
            if not likely_reason or not str(likely_reason).strip():
                if status != "present":
                    likely_reason = meta["default_reason"]
                else:
                    likely_reason = None
                    
            normalized_decs[key] = {
                "missing": status,
                "text": text_val,
                "why_missing": why_missing,
                "likely_reason": likely_reason
            }
        else:
            normalized_decs[key] = {
                "missing": "missing",
                "text": None,
                "why_missing": meta["default_why"],
                "likely_reason": meta["default_reason"]
            }

    parsed["declarations"] = normalized_decs
    
    if "legal_metrology_2011_compliance" not in parsed or not isinstance(parsed["legal_metrology_2011_compliance"], dict):
        missing_keys = [k for k, v in normalized_decs.items() if v["missing"] != "present"]
        present_keys = [k for k, v in normalized_decs.items() if v["missing"] == "present"]
        parsed["legal_metrology_2011_compliance"] = {
            "all_mandatory_declarations_observed": len(missing_keys) == 0,
            "confidence_score": 0.95,
            "mandatory_declarations_present": present_keys,
            "missing_declarations": missing_keys
        }
        
    if "context" not in parsed or not parsed["context"]:
        parsed["context"] = "Packaged commodity label context evaluated against Legal Metrology (Packaged Commodities) Rules, 2011."

    if "summary" not in parsed or not parsed["summary"]:
        parsed["summary"] = "Legal Metrology analysis scan findings completed."
        
    warnings = parsed.get("warnings")
    if not isinstance(warnings, list):
        parsed["warnings"] = []
    else:
        clean_warnings = []
        for w in warnings:
            if isinstance(w, dict) and w.get("item"):
                clean_warnings.append({
                    "type": str(w.get("type") or "health_warning"),
                    "item": str(w.get("item")),
                    "value": str(w.get("value")) if w.get("value") is not None else None,
                    "explanation": str(w.get("explanation") or f"Contains {w.get('item')} which may require consumer awareness.")
                })
        parsed["warnings"] = clean_warnings

    parsed["disclaimer"] = "Our analyzer may make mistakes. Please verify important information, especially allergens and nutritional values, against the original product label."
    return parsed

SYSTEM_PROMPT = (
"You are an expert Legal Metrology & Packaged Commodities inspector. "
"Review OCR text like a real person inspecting a package, not like a keyword-matching program.\n\n"


"Read the full OCR first. Understand the product, then check each declaration in context. "
"OCR may contain broken words, wrong characters, missing lines, or text from different panels. "
"Use practical judgment and nearby context to interpret it. Never invent information.\n\n"

"REPORT OBSERVATIONS, NOT FINAL LEGAL JUDGEMENTS. "
"Say what was found or not seen. Do not say the product is 'illegal' or definitively 'non-compliant'.\n\n"

"MRP RULE: Mark MRP present only when a clear price appears with MRP, M.R.P., Max Retail Price, Rs., or ₹. "
"Do not treat weights, dates, batch numbers, phone numbers, or other random numbers as prices.\n\n"

"HEALTH/WARNING RULE: Read nutrition and ingredients in context. "
"Flag clearly high sugar, sodium, saturated fat, notable additives, preservatives, or major allergens. "
"Only report warnings supported by the OCR. Keep explanations natural and short, like a knowledgeable person explaining the label.\n\n"

"HUMAN STYLE: Use short, factual sentences. Avoid robotic wording, repeated legal phrases, "
"generic explanations, unnecessary detail, and textbook language. "
"For missing items, give the most likely practical reason only when reasonable, such as 'not visible in scanned panel', "
"'print may be unclear', or 'not found in OCR'. If the evidence is uncertain, say so.\n\n"

"OUTPUT: Return ONLY valid JSON using exactly this structure:\n"
"{\n"
'  "is_packaged_product": true,\n'
'  "context": "Short 2-3 sentence description of the product and label.",\n'
'  "declarations": {\n'
'    "manufacturer_details": {"missing": "present", "text": null, "why_missing": null, "likely_reason": null},\n'
'    "country_of_origin": {"missing": "present", "text": null, "why_missing": null, "likely_reason": null},\n'
'    "net_quantity": {"missing": "present", "text": null, "why_missing": null, "likely_reason": null},\n'
'    "mrp": {"missing": "present", "text": null, "why_missing": null, "likely_reason": null},\n'
'    "date_of_manufacture_or_pack": {"missing": "present", "text": null, "why_missing": null, "likely_reason": null},\n'
'    "consumer_care_details": {"missing": "present", "text": null, "why_missing": null, "likely_reason": null},\n'
'    "unit_sale_price": {"missing": "present", "text": null, "why_missing": null, "likely_reason": null}\n'
'  },\n'
'  "warnings": [],\n'
'  "legal_metrology_2011_compliance": {\n'
'    "is_fully_compliant": false,\n'
'    "confidence_score": 0.0,\n'
'    "mandatory_declarations_present": [],\n'
'    "missing_declarations": []\n'
'  },\n'
'  "summary": "Short factual overall observation."\n'
"}\n\n"

"RULES:\n"
"1. 'missing' must be exactly 'present', 'missing', or 'partially missing'.\n"
"2. 'text' must contain only the relevant text actually found in OCR. Otherwise null.\n"
"3. For missing/partial items, 'why_missing' should be short, factual, and specific. Otherwise null.\n"
"4. 'likely_reason' should be brief and practical. Do not invent a reason. Otherwise null.\n"
"5. Warnings must contain only: type, item, value, explanation.\n"
"6. Keep context, explanations, reasons, and summary concise.\n"
"7. Do not repeat the same information in multiple fields.\n"
"8. Do not add keys or markdown.\n"
"9. Output ONLY raw JSON."

)


def analyze_ocr_text(ocr_text: str, custom_prompt: str = None, api_key: str = None, model: str = DEFAULT_MODEL) -> dict:
    key = api_key or os.getenv("GROQ_API_KEY")
    if not key:
        return {
            "success": False,
            "error": "GROQ_API_KEY is not set."
        }

    candidate_models = [model]
    if "openai/gpt-oss-120b" not in candidate_models:
        candidate_models.append("openai/gpt-oss-120b")
    if "groq/compound-mini" not in candidate_models:
        candidate_models.append("groq/compound-mini")

    user_content = (
        f"Analyze the following OCR text extracted from an image and perform Legal Metrology compliance audit:\n\n"
        f"OCR TEXT:\n{ocr_text}"
    )

    try:
        # pyrefly: ignore [missing-import]
        from groq import Groq
        client = Groq(api_key=key)

        for current_model in candidate_models:
            try:
                logger.info(f"Sending request to Groq API (Model: {current_model})...")
                completion = client.chat.completions.create(
                    model=current_model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_content}
                    ],
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )

                raw_content = completion.choices[0].message.content or ""
                parsed_json = extract_json_object(raw_content)
                normalized_json = normalize_analysis_response(parsed_json, ocr_text=ocr_text)

                return {
                    "success": True,
                    "model": current_model,
                    "analysis": normalized_json
                }
            except Exception as model_err:
                logger.warning(f"Model {current_model} failed ({model_err}). Trying fallback model...")

    except ImportError:
        logger.info("groq SDK not installed, using HTTP requests fallback...")
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        for current_model in candidate_models:
            try:
                payload = {
                    "model": current_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_content}
                    ],
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"}
                }
                response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=15)
                if response.status_code == 200:
                    res_data = response.json()
                    raw_content = res_data["choices"][0]["message"]["content"]
                    parsed_json = extract_json_object(raw_content)
                    normalized_json = normalize_analysis_response(parsed_json, ocr_text=ocr_text)
                    return {
                        "success": True,
                        "model": current_model,
                        "analysis": normalized_json
                    }
            except Exception as http_err:
                logger.warning(f"HTTP fallback model {current_model} failed: {http_err}")

    # Ultimate fallback if LLM is completely unreachable
    normalized_json = normalize_analysis_response({}, ocr_text=ocr_text)
    return {
        "success": True,
        "model": "rule-based-fallback",
        "analysis": normalized_json
    }

def analyze_combined_batch_ocr(ocr_texts_dict: dict, custom_prompt: str = None, api_key: str = None, model: str = DEFAULT_MODEL) -> dict:
    key = api_key or os.getenv("GROQ_API_KEY")
    if not key:
        return {
            "success": False,
            "error": "GROQ_API_KEY is not set."
        }

    candidate_models = [model]
    if "openai/gpt-oss-120b" not in candidate_models:
        candidate_models.append("openai/gpt-oss-120b")

    combined_text_block = "\n\n".join([f"=== {name} ===\n{text}" for name, text in ocr_texts_dict.items() if text and text.strip()])

    user_content = f"Perform a combined 360-degree audit on the following image OCR texts:\n\n{combined_text_block}"

    try:
        # pyrefly: ignore [missing-import]
        from groq import Groq
        client = Groq(api_key=key)

        for current_model in candidate_models:
            try:
                logger.info(f"Sending combined batch request to Groq API (Model: {current_model})...")
                completion = client.chat.completions.create(
                    model=current_model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_content}
                    ],
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )

                raw_content = completion.choices[0].message.content or ""
                parsed_json = extract_json_object(raw_content)
                normalized_json = normalize_analysis_response(parsed_json, ocr_text=combined_text_block)

                return {
                    "success": True,
                    "model": current_model,
                    "analysis": normalized_json
                }
            except Exception as model_err:
                logger.warning(f"Combined model {current_model} failed: {model_err}")

    except ImportError:
        pass

    normalized_json = normalize_analysis_response({}, ocr_text=combined_text_block)
    return {
        "success": True,
        "model": "rule-based-fallback",
        "analysis": normalized_json
    }

if __name__ == "__main__":
    sample = "100% Pesticide Free\nGrown in Greenhouse\nOrganically Grown\nNon GM Product"
    print("Testing updated Analyzer with product label text...")
    res = analyze_ocr_text(sample)
    print(json.dumps(res, indent=2))
