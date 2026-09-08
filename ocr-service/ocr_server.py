import base64
import json
import logging
import os
import time
import requests
# pyrefly: ignore [missing-import]
import cv2
# pyrefly: ignore [missing-import]
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask, request, jsonify
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from paddleocr import PaddleOCR
from analyzer import analyze_ocr_text, analyze_combined_batch_ocr

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ocr_service")

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Global OCR Engine instance
ocr_engine = None

def initialize_ocr_engine():
    """Initializes global PaddleOCR engine once at startup with warm-up call and MKL-DNN CPU acceleration."""
    global ocr_engine
    logger.info("Initializing PaddleOCR engine with MKL-DNN CPU acceleration...")
    start_time = time.time()
    
    # Try GPU first, fall back to high-speed CPU mode with MKL-DNN
    try:
        ocr_engine = PaddleOCR(use_angle_cls=False, lang='en', use_gpu=True)
        dummy_img = np.zeros((50, 50, 3), dtype=np.uint8)
        _ = ocr_engine.ocr(dummy_img, cls=False)
        logger.info("PaddleOCR initialized successfully with GPU acceleration.")
    except Exception as gpu_err:
        logger.warning(f"GPU acceleration unavailable ({gpu_err}). Enabling high-speed MKL-DNN CPU mode...")
        ocr_engine = PaddleOCR(use_angle_cls=False, lang='en', use_gpu=False, enable_mkldnn=True, cpu_threads=6)
        dummy_img = np.zeros((50, 50, 3), dtype=np.uint8)
        _ = ocr_engine.ocr(dummy_img, cls=False)
        logger.info("PaddleOCR initialized successfully with MKL-DNN multi-threaded CPU mode.")

    init_duration = time.time() - start_time
    logger.info(f"OCR warm-up call complete. Startup took {init_duration:.2f} seconds.")


# Execute initialization at startup
initialize_ocr_engine()

def calculate_font_metrics(box, dpi=300):
    """
    Calculates height (px), width (px), and font size (mm) from 4-point bounding box polygon.
    box format: [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]
    """
    box_arr = np.array(box, dtype=np.float32)
    p0, p1, p2, p3 = box_arr[0], box_arr[1], box_arr[2], box_arr[3]

    # Height: average distance of left edge (p0->p3) and right edge (p1->p2)
    h_left = float(np.linalg.norm(p3 - p0))
    h_right = float(np.linalg.norm(p2 - p1))
    height_px = (h_left + h_right) / 2.0

    # Width: average distance of top edge (p0->p1) and bottom edge (p3->p2)
    w_top = float(np.linalg.norm(p1 - p0))
    w_bottom = float(np.linalg.norm(p2 - p3))
    width_px = (w_top + w_bottom) / 2.0

    # Font size in mm: (height_px / dpi) * 25.4
    font_size_mm = (height_px / float(dpi)) * 25.4 if dpi > 0 else 0.0

    return {
        "height_px": round(height_px, 2),
        "width_px": round(width_px, 2),
        "font_size_mm": round(font_size_mm, 2)
    }

def generate_annotated_image(img, lines):
    """
    Draws green bounding boxes and font size (mm) tags on the image.
    Returns Base64 encoded string of the annotated image.
    """
    annotated_img = img.copy()
    for line in lines:
        box = np.array(line["box"], dtype=np.int32)
        font_size_mm = line["font_size_mm"]
        
        # 1. Draw green bounding box polygon
        cv2.polylines(annotated_img, [box], isClosed=True, color=(0, 255, 0), thickness=2)
        
        # 2. Draw font size tag (e.g. "3.5mm")
        label = f"{font_size_mm}mm"
        top_left_x = int(box[0][0])
        top_left_y = max(15, int(box[0][1]) - 5)
        
        (w, h), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        cv2.rectangle(
            annotated_img,
            (top_left_x, top_left_y - h - baseline),
            (top_left_x + w, top_left_y + baseline),
            (255, 255, 255),
            cv2.FILLED
        )
        cv2.putText(
            annotated_img,
            label,
            (top_left_x, top_left_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (0, 0, 255),
            1,
            cv2.LINE_AA
        )

    _, buffer = cv2.imencode('.jpg', annotated_img)
    return base64.b64encode(buffer).decode('utf-8')


@app.route("/", methods=["GET"])
@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for Node.js / Express microservice monitoring."""
    return jsonify({
        "status": "healthy",
        "service": "PaddleOCR Microservice",
        "port": int(os.getenv("PORT", 5001)),
        "engine_ready": ocr_engine is not None
    }), 200

@app.route("/", methods=["POST"])
@app.route("/ocr", methods=["POST"])
def process_ocr():
    """
    POST /ocr
    Accepts:
      1. JSON payload with Base64: { "image": "<base64_string>", "dpi": 300 }
      2. JSON payload with Image URL: { "image_url": "https://domain.com/image.jpg", "dpi": 300 }
      3. Multipart Form-Data: file field 'file' or 'image', form field 'dpi'
    Returns:
      Extracted text string, array of lines with confidence, font_size_mm, and bounding boxes.
    """
    start_req = time.time()
    img = None
    dpi = 300

    # Option 1: Multipart File Upload (e.g. from Express multer or FormData)
    if request.files and ('file' in request.files or 'image' in request.files):
        file_obj = request.files.get('file') or request.files.get('image')
        try:
            dpi = int(request.form.get('dpi', 300))
        except (ValueError, TypeError):
            dpi = 300
        try:
            image_bytes = file_obj.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as file_err:
            return jsonify({"success": False, "error": f"Failed to read uploaded file: {str(file_err)}"}), 400

    # Option 2: JSON Payload (Base64 or Image URL)
    elif request.is_json or request.content_type == 'application/json':
        data = request.get_json(silent=True) or {}
        try:
            dpi = int(data.get("dpi", 300))
        except (ValueError, TypeError):
            dpi = 300
        image_url = data.get("image_url") or data.get("url")
        base64_string = data.get("image") or data.get("image_base64") or data.get("base64")

        # 2a. Process HTTP / HTTPS Image URL
        if image_url and isinstance(image_url, str):
            try:
                logger.info(f"Fetching image from URL: {image_url}")
                resp = requests.get(image_url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
                if resp.status_code != 200:
                    return jsonify({"success": False, "error": f"Failed to fetch image URL (HTTP {resp.status_code})"}), 400
                nparr = np.frombuffer(resp.content, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except Exception as url_err:
                return jsonify({"success": False, "error": f"Error downloading image URL: {str(url_err)}"}), 400

        # 2b. Process Base64 string
        elif base64_string and isinstance(base64_string, str):
            if "," in base64_string:
                base64_string = base64_string.split(",", 1)[1]

            try:
                image_bytes = base64.b64decode(base64_string)
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except Exception as decode_err:
                return jsonify({"success": False, "error": f"Base64 decode error: {str(decode_err)}"}), 400
        else:
            return jsonify({
                "success": False,
                "error": "Missing required field 'image' (base64) or 'image_url' (HTTP URL) in JSON payload."
            }), 400

    if img is None:
        return jsonify({
            "success": False,
            "error": "Could not parse valid image matrix. Ensure valid image file, base64 string, or image URL."
        }), 400

    # Execute PaddleOCR text extraction
    try:
        raw_ocr_res = ocr_engine.ocr(img, cls=False)
        formatted_lines = []

        if raw_ocr_res and isinstance(raw_ocr_res, list) and len(raw_ocr_res) > 0:
            res = raw_ocr_res[0]
            if res is not None:
                for item in res:
                    if isinstance(item, list) and len(item) >= 2:
                        box_points = item[0]
                        text_conf = item[1]
                        
                        if isinstance(text_conf, (list, tuple)):
                            text = text_conf[0]
                            confidence = float(text_conf[1])
                        else:
                            text = str(text_conf)
                            confidence = 1.0

                        clean_box = [[float(pt[0]), float(pt[1])] for pt in box_points]
                        metrics = calculate_font_metrics(clean_box, dpi=dpi)
                        formatted_lines.append({
                            "text": text,
                            "confidence": round(confidence, 4),
                            "box": clean_box,
                            "font_size_mm": metrics["font_size_mm"],
                            "height_px": metrics["height_px"],
                            "width_px": metrics["width_px"]
                        })

        elapsed = time.time() - start_req
        full_extracted_text = "\n".join([line["text"] for line in formatted_lines])

        # Generate annotated image with bounding boxes and font size (mm) tags
        annotated_image_b64 = generate_annotated_image(img, formatted_lines)

        logger.info(f"Processed OCR request: {len(formatted_lines)} lines detected in {elapsed:.3f}s (DPI: {dpi})")

        # Step 1: Send ONLY extracted text to Groq LLM for AI analysis
        req_data = (request.get_json(silent=True) or {}) if request.is_json else {}
        custom_prompt = req_data.get("prompt") or request.form.get("prompt")
        
        logger.info("Sending extracted text labels to Groq LLM for AI analysis...")
        llm_result = analyze_ocr_text(full_extracted_text, custom_prompt=custom_prompt)

        # Step 2: Prepare Node.js webhook payload (Annotated image + text + LLM analysis)
        forward_target = req_data.get("forward_url") or req_data.get("node_server_url") or os.getenv("NODE_SERVER_URL")
        forwarded_status = False
        forward_info = None

        if forward_target:
            try:
                logger.info(f"Forwarding annotated image + OCR text + LLM analysis to Node.js server: {forward_target}")
                forward_payload = {
                    "image": annotated_image_b64,  # Base64 annotated image with bounding boxes & font size tags
                    "text": full_extracted_text,
                    "lines": formatted_lines,
                    "count": len(formatted_lines),
                    "dpi": dpi,
                    "llm_analysis": llm_result.get("analysis") if llm_result.get("success") else llm_result
                }
                fwd_res = requests.post(forward_target, json=forward_payload, timeout=10)
                logger.info(f"Forwarding complete. Node.js server returned HTTP {fwd_res.status_code}")
                forwarded_status = True
                forward_info = {"status_code": fwd_res.status_code}
            except Exception as fwd_err:
                logger.error(f"Failed to forward payload to Node.js server ({forward_target}): {fwd_err}")
                forwarded_status = False
                forward_info = {"error": str(fwd_err)}

        # Step 3: Return clean response to client focusing on LLM analysis
        response_payload = {
            "success": True,
            "text": full_extracted_text,
            "count": len(formatted_lines),
            "llm_analysis": llm_result.get("analysis") if llm_result.get("success") else llm_result,
            "processing_time_sec": round(elapsed, 4),
            "forwarded_to_node": forwarded_status
        }
        if forward_info:
            response_payload["forward_info"] = forward_info

        return jsonify(response_payload), 200



    except Exception as proc_err:
        logger.error(f"OCR execution failure: {proc_err}", exc_info=True)
        return jsonify({
            "success": False,
            "error": f"Internal OCR processing error: {str(proc_err)}"
        }), 500

@app.route("/analyze", methods=["POST"])
def analyze_text_endpoint():
    """
    POST /analyze
    Accepts JSON:
      {
        "text": "Extracted OCR text...",
        "prompt": "Optional custom prompt",
        "api_key": "Optional GROQ_API_KEY override"
      }
    """
    if not request.is_json:
        return jsonify({"success": False, "error": "Request payload must be JSON."}), 400

    data = request.get_json(silent=True) or {}
    ocr_text = data.get("text") or data.get("ocr_text")
    
    if not ocr_text:
        return jsonify({"success": False, "error": "Missing required field 'text' or 'ocr_text' in JSON payload."}), 400

    custom_prompt = data.get("prompt")
    api_key = data.get("api_key")

    result = analyze_ocr_text(ocr_text, custom_prompt=custom_prompt, api_key=api_key)
    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code

@app.route("/ocr/batch", methods=["POST"])
def process_ocr_batch():
    """
    POST /ocr/batch
    Accepts:
      1. JSON: { "images": ["<base64_1>", "<base64_2>", ...], "image_urls": ["url1", "url2"], "dpi": 300 }
      2. Multipart Form-Data: multiple files under field name 'files' or 'images'
    Processes all images in parallel at original image quality/resolution using ThreadPoolExecutor.
    """
    start_req = time.time()
    dpi = 300
    images_to_process = []  # List of tuples: (index, cv2_image_matrix)

    # 1. Handle Multipart Form Uploads (multiple files)
    if request.files:
        files = request.files.getlist("files") or request.files.getlist("images") or list(request.files.values())
        try:
            dpi = int(request.form.get("dpi", 300))
        except (ValueError, TypeError):
            dpi = 300

        for idx, file_obj in enumerate(files):
            try:
                image_bytes = file_obj.read()
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is not None:
                    images_to_process.append((idx, img))
            except Exception as e:
                logger.error(f"Error reading batch file {idx}: {e}")

    # 2. Handle JSON Payload (list of base64 strings or URLs)
    elif request.is_json or request.content_type == 'application/json':
        data = request.get_json(silent=True) or {}
        try:
            dpi = int(data.get("dpi", 300))
        except (ValueError, TypeError):
            dpi = 300

        b64_list = data.get("images") or data.get("base64_list") or []
        url_list = data.get("image_urls") or data.get("urls") or []

        idx = 0
        for b64 in b64_list:
            if isinstance(b64, str):
                if "," in b64:
                    b64 = b64.split(",", 1)[1]
                try:
                    image_bytes = base64.b64decode(b64)
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    if img is not None:
                        images_to_process.append((idx, img))
                        idx += 1
                except Exception as err:
                    logger.error(f"Error decoding base64 at index {idx}: {err}")

        for url in url_list:
            if isinstance(url, str):
                try:
                    resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
                    if resp.status_code == 200:
                        nparr = np.frombuffer(resp.content, np.uint8)
                        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        if img is not None:
                            images_to_process.append((idx, img))
                            idx += 1
                except Exception as err:
                    logger.error(f"Error downloading batch URL {url}: {err}")

    if not images_to_process:
        return jsonify({
            "success": False,
            "error": "No valid images found in batch request. Send 'images' array in JSON or 'files' in multipart form data."
        }), 400

    req_data = (request.get_json(silent=True) or {}) if request.is_json else {}
    custom_prompt = req_data.get("prompt") or request.form.get("prompt")
    forward_target = req_data.get("forward_url") or req_data.get("node_server_url") or os.getenv("NODE_SERVER_URL")

    def _worker(item):
        index, img = item
        try:
            # Execute PaddleOCR text extraction at full original resolution
            raw_ocr_res = ocr_engine.ocr(img, cls=False)
            formatted_lines = []

            if raw_ocr_res and isinstance(raw_ocr_res, list) and len(raw_ocr_res) > 0:
                res = raw_ocr_res[0]
                if res is not None:
                    for item_box in res:
                        if isinstance(item_box, list) and len(item_box) >= 2:
                            box_points = item_box[0]
                            text_conf = item_box[1]
                            
                            if isinstance(text_conf, (list, tuple)):
                                text = text_conf[0]
                                confidence = float(text_conf[1])
                            else:
                                text = str(text_conf)
                                confidence = 1.0

                            clean_box = [[float(pt[0]), float(pt[1])] for pt in box_points]
                            metrics = calculate_font_metrics(clean_box, dpi=dpi)
                            formatted_lines.append({
                                "text": text,
                                "confidence": round(confidence, 4),
                                "box": clean_box,
                                "font_size_mm": metrics["font_size_mm"],
                                "height_px": metrics["height_px"],
                                "width_px": metrics["width_px"]
                            })

            full_extracted_text = "\n".join([line["text"] for line in formatted_lines])
            annotated_image_b64 = generate_annotated_image(img, formatted_lines)

            return {
                "index": index,
                "image_name": f"Image {index + 1}",
                "success": True,
                "text": full_extracted_text,
                "count": len(formatted_lines),
                "lines": formatted_lines,
                "annotated_image": annotated_image_b64
            }
        except Exception as e:
            logger.error(f"Error processing batch image index {index}: {e}")
            return {
                "index": index,
                "image_name": f"Image {index + 1}",
                "success": False,
                "error": str(e)
            }

    # Step 1: Execute PaddleOCR on all images in parallel across worker threads
    results = [None] * len(images_to_process)
    max_workers = min(8, len(images_to_process))
    
    logger.info(f"Processing batch of {len(images_to_process)} images in parallel with {max_workers} threads...")
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_map = {executor.submit(_worker, item): item[0] for item in images_to_process}
        for future in as_completed(future_map):
            idx = future_map[future]
            try:
                res = future.result()
                results[idx] = res
            except Exception as err:
                results[idx] = {"index": idx, "image_name": f"Image {idx+1}", "success": False, "error": str(err)}

    # Step 2: Combine all OCR texts and run ONE single LLM request (60% faster)
    ocr_texts_dict = {
        res["image_name"]: res.get("text", "") 
        for res in results if res and res.get("success")
    }

    logger.info("Executing single combined 360-degree LLM audit & image mismatch check...")
    combined_llm_result = analyze_combined_batch_ocr(ocr_texts_dict, custom_prompt=custom_prompt)
    combined_audit = combined_llm_result.get("analysis") if combined_llm_result.get("success") else combined_llm_result

    # Step 3: Forward to Node.js server if requested
    if forward_target:
        try:
            logger.info(f"Forwarding batch payload to Node.js server: {forward_target}")
            forward_payload = {
                "total_images": len(images_to_process),
                "combined_audit": combined_audit,
                "images": [
                    {
                        "image_index": r["index"],
                        "annotated_image": r.get("annotated_image"),
                        "text": r.get("text")
                    } for r in results if r and r.get("success")
                ]
            }
            requests.post(forward_target, json=forward_payload, timeout=10)
        except Exception as fwd_err:
            logger.error(f"Batch forward to Node.js failed: {fwd_err}")

    total_elapsed = time.time() - start_req
    logger.info(f"Batch processing complete: {len(images_to_process)} images audited in {total_elapsed:.3f} seconds.")

    return jsonify({
        "success": True,
        "total_images": len(images_to_process),
        "processing_time_sec": round(total_elapsed, 4),
        "combined_audit": combined_audit,
        "images_detail": results
    }), 200

@app.route("/ocr/annotate-only", methods=["POST"])
def process_ocr_annotate_only():
    """
    POST /ocr/annotate-only
    Runs parallel PaddleOCR and generates annotated Base64 images + extracted text.
    Returns immediately WITHOUT waiting for LLM analysis (< 1.5s).
    """
    start_req = time.time()
    dpi = 300
    images_to_process = []

    if request.files:
        files = request.files.getlist("files") or request.files.getlist("images") or list(request.files.values())
        try:
            dpi = int(request.form.get("dpi", 300))
        except (ValueError, TypeError):
            dpi = 300

        for idx, file_obj in enumerate(files):
            try:
                image_bytes = file_obj.read()
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is not None:
                    images_to_process.append((idx, img))
            except Exception as e:
                logger.error(f"Error reading file {idx}: {e}")

    elif request.is_json or request.content_type == 'application/json':
        data = request.get_json(silent=True) or {}
        try:
            dpi = int(data.get("dpi", 300))
        except (ValueError, TypeError):
            dpi = 300

        b64_list = data.get("images") or data.get("base64_list") or []
        url_list = data.get("image_urls") or data.get("urls") or []

        idx = 0
        for b64 in b64_list:
            if isinstance(b64, str):
                if "," in b64:
                    b64 = b64.split(",", 1)[1]
                try:
                    image_bytes = base64.b64decode(b64)
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    if img is not None:
                        images_to_process.append((idx, img))
                        idx += 1
                except Exception as err:
                    logger.error(f"Error decoding base64 at index {idx}: {err}")

        for url in url_list:
            if isinstance(url, str):
                try:
                    resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
                    if resp.status_code == 200:
                        nparr = np.frombuffer(resp.content, np.uint8)
                        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        if img is not None:
                            images_to_process.append((idx, img))
                            idx += 1
                except Exception as err:
                    logger.error(f"Error downloading URL {url}: {err}")

    if not images_to_process:
        return jsonify({"success": False, "error": "No valid images found"}), 400

    def _worker(item):
        index, img = item
        try:
            raw_ocr_res = ocr_engine.ocr(img, cls=False)
            formatted_lines = []
            if raw_ocr_res and isinstance(raw_ocr_res, list) and len(raw_ocr_res) > 0:
                res = raw_ocr_res[0]
                if res is not None:
                    for item_box in res:
                        if isinstance(item_box, list) and len(item_box) >= 2:
                            box_points = item_box[0]
                            text_conf = item_box[1]
                            text = text_conf[0] if isinstance(text_conf, (list, tuple)) else str(text_conf)
                            confidence = float(text_conf[1]) if isinstance(text_conf, (list, tuple)) else 1.0
                            clean_box = [[float(pt[0]), float(pt[1])] for pt in box_points]
                            metrics = calculate_font_metrics(clean_box, dpi=dpi)
                            formatted_lines.append({
                                "text": text,
                                "confidence": round(confidence, 4),
                                "box": clean_box,
                                "font_size_mm": metrics["font_size_mm"],
                                "height_px": metrics["height_px"],
                                "width_px": metrics["width_px"]
                            })
            full_extracted_text = "\n".join([line["text"] for line in formatted_lines])
            annotated_image_b64 = generate_annotated_image(img, formatted_lines)
            return {
                "index": index,
                "image_name": f"Image {index + 1}",
                "success": True,
                "text": full_extracted_text,
                "count": len(formatted_lines),
                "lines": formatted_lines,
                "annotated_image": annotated_image_b64
            }
        except Exception as e:
            return {"index": index, "image_name": f"Image {index + 1}", "success": False, "error": str(e)}

    results = [None] * len(images_to_process)
    max_workers = min(8, len(images_to_process))
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_map = {executor.submit(_worker, item): item[0] for item in images_to_process}
        for future in as_completed(future_map):
            idx = future_map[future]
            try:
                results[idx] = future.result()
            except Exception as err:
                results[idx] = {"index": idx, "image_name": f"Image {idx+1}", "success": False, "error": str(err)}

    elapsed = time.time() - start_req
    logger.info(f"Fast OCR annotation complete: {len(images_to_process)} images in {elapsed:.3f} seconds.")

    return jsonify({
        "success": True,
        "total_images": len(images_to_process),
        "processing_time_sec": round(elapsed, 4),
        "images_detail": results
    }), 200

@app.route("/ocr/audit-only", methods=["POST"])
def process_ocr_audit_only():
    """
    POST /ocr/audit-only
    Accepts JSON: { "ocr_texts": { "Image 1": "text1", "Image 2": "text2" }, "prompt": "..." }
    Runs single combined LLM audit.
    """
    if not request.is_json:
        return jsonify({"success": False, "error": "JSON payload required"}), 400
    data = request.get_json(silent=True) or {}
    ocr_texts = data.get("ocr_texts") or {}
    custom_prompt = data.get("prompt")

    combined_llm_result = analyze_combined_batch_ocr(ocr_texts, custom_prompt=custom_prompt)
    combined_audit = combined_llm_result.get("analysis") if combined_llm_result.get("success") else combined_llm_result
    return jsonify({"success": True, "combined_audit": combined_audit}), 200

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5001))
    logger.info(f"Starting Flask PaddleOCR Microservice server on {host}:{port}...")
    app.run(host=host, port=port, debug=False)
