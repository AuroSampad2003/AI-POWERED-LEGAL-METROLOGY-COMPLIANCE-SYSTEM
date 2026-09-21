"""
Legal Metrology Compliance LLM Fine-Tuning Script (Demonstration / Simulation Module)
---------------------------------------------------------------------------------------
This module simulates domain-specific fine-tuning of an LLM model (e.g., LLaMA-3-8B / Qwen-2.5)
on Legal Metrology packaged commodity label datasets (Indian Legal Metrology Rules, 2011 & 2022 Amendments).

Note: Runs completely isolated. Does not modify or impact active backend/OCR services.
"""

import os
import sys
import time
import json
import random
import math
from datetime import datetime

# Sample Legal Metrology Domain Training Dataset Path
DATASET_FILE = os.path.join(os.path.dirname(__file__), "legal_metrology_dataset.json")

UNITS = ["g", "kg", "ml", "l", "m", "mm", "cm", "gms", "KG", "ML", "Ltrs", "sq.m"]
BRANDS = [
    "Apex Foods Pvt Ltd", "Organic Harvest India", "NutriBlend Spices", "Golden Grain Mills",
    "PureCare Personal Products", "Himalayan Naturals", "Bharat Agro Tech", "Sunlight Consumer Goods",
    "Vedic Wellness Labs", "Royal Feast Spices", "FreshBite Dairy", "Zephyr Healthcare Products",
    "GreenField Bio Organics", "NovaTech Electronics", "Surya Oil Refineries", "Pioneer Tea Estate"
]
CITIES = [
    "Mumbai, Maharashtra", "Bengaluru, Karnataka", "New Delhi, Delhi", "Ahmedabad, Gujarat",
    "Hyderabad, Telangana", "Kolkata, West Bengal", "Pune, Maharashtra", "Chennai, Tamil Nadu",
    "Jaipur, Rajasthan", "Indore, Madhya Pradesh", "Chandigarh, Punjab", "Lucknow, Uttar Pradesh"
]

RULES_REFERENCE = [
    "Rule 6(1)(a) - Name and address of manufacturer/packer/importer",
    "Rule 6(1)(b) - Country of origin for imported products",
    "Rule 6(1)(c) - Common or generic name of commodity",
    "Rule 6(1)(d) - Net quantity in standard units of weight/measure",
    "Rule 6(1)(e) - Month and year of manufacture/pre-packing/import",
    "Rule 6(1)(f) - Maximum Retail Price (MRP) inclusive of all taxes",
    "Rule 6(1)(g) - Dimensions/sizes of commodity where applicable",
    "Rule 6(2) - Consumer Care contact details (Phone, Email, Address)",
    "Rule 13 - Standard units of weight, measure or number",
    "Rule 18(1) - No retail dealer shall sell packaged commodity above MRP"
]


class LegalMetrologyDataEngine:
    """Handles synthetic dataset creation for Legal Metrology AI fine-tuning."""

    def __init__(self, num_samples=1250):
        self.num_samples = num_samples

    def generate_sample(self, idx):
        sample_type = random.choice(["compliant", "non_standard_unit", "missing_mfr", "imported", "dual_mrp"])

        if sample_type == "compliant":
            return {
                "id": f"LM-DATA-{idx:04d}",
                "rule_domain": "Legal Metrology (Packaged Commodities) Rules 2011",
                "instruction": "Perform legal compliance audit on extracted packaging label text.",
                "input": f"Mfd Date: {random.randint(1,12):02d}/{random.randint(2023,2025)} | Net Qty: {random.randint(100, 1000)}{random.choice(['g', 'kg', 'ml', 'l'])} | MRP Rs. {random.randint(50, 999)}.00 (Incl. of all taxes) | Mfd by: {random.choice(BRANDS)}, {random.choice(CITIES)} | Helpline: 1800-{random.randint(100,999)}-{random.randint(1000,9999)}.",
                "output": {
                    "compliant": True,
                    "violations_found": [],
                    "missing_mandatory_declarations": [],
                    "compliance_score": 100,
                    "legal_action_required": False
                }
            }
        elif sample_type == "non_standard_unit":
            bad_unit = random.choice(["gms", "KG", "Ltrs", "ML", "kgs"])
            return {
                "id": f"LM-DATA-{idx:04d}",
                "rule_domain": "Rule 13 - Standard Units of Measurement",
                "instruction": "Identify non-standard measurement units used on packaged commodity label.",
                "input": f"Net Weight: {random.randint(100,900)} {bad_unit} | Price: Rs {random.randint(40, 500)} | Batch: B-{random.randint(1000,9999)}",
                "output": {
                    "compliant": False,
                    "violations_found": [f"Invalid unit symbol '{bad_unit}'. Only standard SI symbols (g, kg, ml, l) permitted."],
                    "missing_mandatory_declarations": ["Manufacturing Month/Year", "Manufacturer Address"],
                    "compliance_score": 45,
                    "legal_action_required": True
                }
            }
        elif sample_type == "missing_mfr":
            return {
                "id": f"LM-DATA-{idx:04d}",
                "rule_domain": "Rule 6(1)(a) & Rule 6(2) - Manufacturer & Care Details",
                "instruction": "Check for missing manufacturer and consumer grievance details.",
                "input": f"Net Content: {random.randint(250,1000)}g | MRP: Rs {random.randint(100, 1200)} | Packed by Local Packager.",
                "output": {
                    "compliant": False,
                    "violations_found": ["Absence of complete manufacturer address and consumer care helpline."],
                    "missing_mandatory_declarations": ["Full Name & Address of Manufacturer", "Consumer Care Contact Number", "Month & Year of Packing"],
                    "compliance_score": 30,
                    "legal_action_required": True
                }
            }
        elif sample_type == "imported":
            return {
                "id": f"LM-DATA-{idx:04d}",
                "rule_domain": "Rule 6(1)(b) - Mandatory Declarations for Imported Goods",
                "instruction": "Evaluate compliance for imported packaged commodity.",
                "input": f"Imported & Marketed by: {random.choice(BRANDS)}, {random.choice(CITIES)} | Country of Origin: {random.choice(['Vietnam', 'Germany', 'USA', 'Japan', 'South Korea'])} | Month of Import: {random.randint(1,12):02d}/2024 | Net Content: {random.randint(1,5)} N | MRP: Rs {random.randint(1500, 8000)}.00 (Incl. of all taxes).",
                "output": {
                    "compliant": True,
                    "violations_found": [],
                    "missing_mandatory_declarations": [],
                    "compliance_score": 98,
                    "legal_action_required": False
                }
            }
        else: # dual MRP / overcharging
            return {
                "id": f"LM-DATA-{idx:04d}",
                "rule_domain": "Rule 18(1) - Dual MRP & Overcharging Violations",
                "instruction": "Audit label for illegal dual pricing or conflicting MRP tags.",
                "input": f"Net Qty: 500g | MRP Tag A: Rs 200 | MRP Tag B (Sticker): Rs 250 | Mfd by: {random.choice(BRANDS)}",
                "output": {
                    "compliant": False,
                    "violations_found": ["Dual MRP declaration detected. Smudged or overlayed price stickers violate Rule 18(1)."],
                    "missing_mandatory_declarations": [],
                    "compliance_score": 20,
                    "legal_action_required": True
                }
            }

    def build_dataset(self):
        dataset = []
        for i in range(1, self.num_samples + 1):
            dataset.append(self.generate_sample(i))
        return dataset


class LLMModelTrainerSimulator:
    """Simulates LoRA SFT fine-tuning pipeline for presentation and demonstration."""

    def __init__(self, dataset_path, base_model="meta-llama/Llama-3-8B-Instruct"):
        self.dataset_path = dataset_path
        self.base_model = base_model
        self.gpu_device = "NVIDIA RTX 4090 24GB"
        self.vram_allocated = "14.8 GB"
        self.lora_rank = 16
        self.lora_alpha = 32
        self.target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]

    def load_dataset(self):
        if not os.path.exists(self.dataset_path):
            engine = LegalMetrologyDataEngine(num_samples=1250)
            data = engine.build_dataset()
            with open(self.dataset_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            print(f"[Dataset Engine] Generated dataset file with {len(data)} items at: {self.dataset_path}")
        
        with open(self.dataset_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def print_header(self, total_samples, epochs, batch_size, learning_rate):
        print("================================================================================")
        print("     LEGAL METROLOGY COMPLIANCE LLM FINE-TUNING PIPELINE (LoRA / SFT)          ")
        print("================================================================================")
        print(f"[*] Timestamp            : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"[*] Base Model Architecture: {self.base_model}")
        print(f"[*] Accelerator Device   : {self.gpu_device} (VRAM: {self.vram_allocated})")
        print(f"[*] Target Domain        : Indian Legal Metrology Rules (2011 & 2022 Amendments)")
        print(f"[*] Dataset Location     : {self.dataset_path}")
        print(f"[*] Total Fine-Tune Pairs: {total_samples} prompt-completion tuples")
        print(f"[*] PEFT Method          : LoRA (r={self.lora_rank}, lora_alpha={self.lora_alpha})")
        print(f"[*] Target Modules       : {', '.join(self.target_modules)}")
        print(f"[*] Hyperparameters      : Epochs={epochs} | Per-GPU Batch={batch_size} | LR={learning_rate}")
        print("================================================================================")

    def simulate_tokenization(self, dataset):
        print("\n[Phase 1/4] Initializing Tokenizer & Preparing Dataset Batches...")
        time.sleep(0.6)
        print(f"[+] Loaded LlamaTokenizerFast (Vocab Size: 128,256 tokens)")
        print(f"[+] Max Sequence Length  : 2048 tokens")
        print(f"[+] Formatting Prompts   : Applying ChatML / Llama-3 Header Format")
        time.sleep(0.6)
        print(f"[+] Tokenized {len(dataset)} instruction pairs. Token counts calculated.")

    def simulate_model_loading(self):
        print("\n[Phase 2/4] Loading Base Model Weights & Injecting LoRA Adapters...")
        time.sleep(0.6)
        print(f"[+] Loading bfloat16 base weights into GPU memory...")
        print(f"[+] Total Parameters     : 8,030,261,248 (8.03B)")
        print(f"[+] Trainable Parameters : 6,815,744 (0.0848% of base model)")
        print(f"[+] Frozen Parameters    : 8,023,445,504")

    def run_training_loop(self, total_samples, epochs=3, batch_size=4, learning_rate=2e-5):
        steps_per_epoch = max(10, total_samples // batch_size)
        total_steps = epochs * steps_per_epoch
        current_loss = 2.8450

        print(f"\n[Phase 3/4] Executing Fine-Tuning Training Loop ({total_steps} Iterations)...")
        print("-" * 85)

        for epoch in range(1, epochs + 1):
            print(f"\n--- Epoch {epoch}/{epochs} (Steps 1..{steps_per_epoch}) ---")
            for step in range(1, steps_per_epoch + 1):
                step_num = (epoch - 1) * steps_per_epoch + step
                
                # Mathematical decay curve simulation
                decay_factor = math.exp(-step_num / (total_steps * 0.4))
                loss_noise = random.uniform(-0.003, 0.003)
                current_loss = max(0.1420, round(2.8450 * decay_factor + loss_noise, 4))
                
                grad_norm = round(random.uniform(0.18, 0.62), 4)
                lr = learning_rate * (0.5 * (1 + math.cos(math.pi * step_num / total_steps)))

                progress_ratio = step / steps_per_epoch
                bar_len = 25
                filled = int(progress_ratio * bar_len)
                bar = "=" * filled + ">" + "." * (bar_len - filled)

                sys.stdout.write(
                    f"\rStep [{step:03d}/{steps_per_epoch:03d}] [{bar}] | Loss: {current_loss:.4f} | "
                    f"GradNorm: {grad_norm:.4f} | LR: {lr:.2e}"
                )
                sys.stdout.flush()
                time.sleep(0.015)
            print()

        print("-" * 85)
        print(f"[+] Training Completed Successfully!")
        print(f"[+] Final Cross-Entropy Loss: {current_loss:.4f}")

    def simulate_export(self):
        print("\n[Phase 4/4] Merging LoRA Weights & Saving Fine-Tuned Model...")
        time.sleep(0.6)
        print("[+] Merging adapter weights into LLaMA-3 base transformer layers...")
        time.sleep(0.6)
        export_dir = os.path.join(os.path.dirname(__file__), "models", "fine_tuned_legal_metrology_llama3")
        print(f"[+] Model checkpoint exported to: {export_dir}")
        print("[+] Generated GGUF (Q4_K_M) quant for edge OCR deployment.")
        print("================================================================================")


def main():
    trainer = LLMModelTrainerSimulator(DATASET_FILE)
    dataset = trainer.load_dataset()
    
    epochs = 3
    batch_size = 4
    learning_rate = 2e-5
    
    trainer.print_header(len(dataset), epochs, batch_size, learning_rate)
    trainer.simulate_tokenization(dataset)
    trainer.simulate_model_loading()
    trainer.run_training_loop(len(dataset), epochs, batch_size, learning_rate)
    trainer.simulate_export()


if __name__ == "__main__":
    main()
