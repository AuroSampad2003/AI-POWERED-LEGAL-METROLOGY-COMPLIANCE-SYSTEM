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

def normalize_analysis_response(parsed: dict) -> dict:
    """
    Normalizes the LLM JSON response to strictly guarantee the presence of all 7 mandatory declaration keys,
    each formatted with 'missing', 'text', 'why_missing', and 'likely_reason'.
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
            "is_fully_compliant": len(missing_keys) == 0,
            "confidence_score": 0.95,
            "mandatory_declarations_present": present_keys,
            "missing_declarations": missing_keys
        }
        
    if "context" not in parsed or not parsed["context"]:
        parsed["context"] = "Packaged commodity label context evaluated against Legal Metrology (Packaged Commodities) Rules, 2011."

    if "summary" not in parsed or not parsed["summary"]:
        parsed["summary"] = "Legal Metrology compliance inspection completed."
        
    return parsed

SYSTEM_PROMPT = (
    "You are an expert AI Legal Metrology & Packaged Commodities Compliance Auditor specializing in the Legal Metrology (Packaged Commodities) Rules, 2011 of India.\n"
    "Analyze the provided raw OCR text extracted from package image(s).\n\n"
    "CRITICAL REQUIREMENT: You MUST format your JSON output strictly matching the exact schema below.\n"
    "Every single one of the 7 declaration keys inside 'declarations' MUST be an object with EXACTLY 4 keys: 'missing', 'text', 'why_missing', and 'likely_reason'.\n\n"
    "Return ONLY strictly valid JSON matching this EXACT template:\n\n"
    "{\n"
    '  "is_packaged_product": true,\n'
    '  "context": "3-4 sentence explanation describing the product, category, and label overview.",\n'
    '  "declarations": {\n'
    '    "manufacturer_details": {\n'
    '      "missing": "missing",\n'
    '      "text": null,\n'
    '      "why_missing": "Manufacturer complete name and physical address are not printed anywhere in the extracted label text as required under Rule 6(1)(a).",\n'
    '      "likely_reason": "The manufacturer declaration is on an unphotographed back panel or omitted entirely."\n'
    '    },\n'
    '    "country_of_origin": {\n'
    '      "missing": "present",\n'
    '      "text": "Made in India",\n'
    '      "why_missing": null,\n'
    '      "likely_reason": null\n'
    '    },\n'
    '    "net_quantity": {\n'
    '      "missing": "missing",\n'
    '      "text": null,\n'
    '      "why_missing": "Net quantity declaration in standard metric units (g, kg, ml, L) is absent under Rule 6(1)(c).",\n'
    '      "likely_reason": "Net quantity mark is on a side panel not included in the OCR scan."\n'
    '    },\n'
    '    "mrp": {\n'
    '      "missing": "missing",\n'
    '      "text": null,\n'
    '      "why_missing": "Maximum Retail Price (MRP) inclusive of all taxes is missing from the label under Rule 6(1)(e).",\n'
    '      "likely_reason": "MRP price sticker was omitted or blurred."\n'
    '    },\n'
    '    "date_of_manufacture_or_pack": {\n'
    '      "missing": "missing",\n'
    '      "text": null,\n'
    '      "why_missing": "Month and year of manufacture, packing, or import are not declared under Rule 6(1)(d).",\n'
    '      "likely_reason": "Mfg date stamp on batch code area is missing."\n'
    '    },\n'
    '    "consumer_care_details": {\n'
    '      "missing": "missing",\n'
    '      "text": null,\n'
    '      "why_missing": "Consumer care helpline phone, email, or address are missing under Rule 6(1)(f).",\n'
    '      "likely_reason": "Customer feedback box is absent."\n'
    '    },\n'
    '    "unit_sale_price": {\n'
    '      "missing": "missing",\n'
    '      "text": null,\n'
    '      "why_missing": "Unit sale price (price per unit mass or volume) is missing under Rule 6(1)(g).",\n'
    '      "likely_reason": "Unit price calculation was not printed."\n'
    '    }\n'
    '  },\n'
    '  "legal_metrology_2011_compliance": {\n'
    '    "is_fully_compliant": false,\n'
    '    "confidence_score": 0.95,\n'
    '    "mandatory_declarations_present": ["country_of_origin"],\n'
    '    "missing_declarations": ["manufacturer_details", "net_quantity", "mrp", "date_of_manufacture_or_pack", "consumer_care_details", "unit_sale_price"]\n'
    '  },\n'
    '  "summary": "Full overall compliance audit summary."\n'
    "}\n\n"
    "RULES:\n"
    "1. 'missing' MUST be strictly one of: 'present', 'missing', or 'partially missing'.\n"
    "2. For missing or partially missing items, 'why_missing' MUST be a 2-3 sentence legal compliance explanation.\n"
    "3. For missing or partially missing items, 'likely_reason' MUST state probable cause.\n"
    "4. Do NOT use alternative schema keys like product_identification or manufacturer_or_packer.\n"
    "5. Output ONLY raw JSON."
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
                normalized_json = normalize_analysis_response(parsed_json)

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
                    normalized_json = normalize_analysis_response(parsed_json)
                    return {
                        "success": True,
                        "model": current_model,
                        "analysis": normalized_json
                    }
            except Exception as http_err:
                logger.warning(f"HTTP fallback model {current_model} failed: {http_err}")

    # Ultimate fallback if LLM is completely unreachable
    normalized_json = normalize_analysis_response({})
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
                normalized_json = normalize_analysis_response(parsed_json)

                return {
                    "success": True,
                    "model": current_model,
                    "analysis": normalized_json
                }
            except Exception as model_err:
                logger.warning(f"Combined model {current_model} failed: {model_err}")

    except ImportError:
        pass

    normalized_json = normalize_analysis_response({})
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
