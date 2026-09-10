import PDFDocument from 'pdfkit';

const DECLARATION_META = [
    { key: 'manufacturer_details', title: 'Manufacturer / Packer Details', rule: 'Rule 6(1)(a)' },
    { key: 'country_of_origin', title: 'Country of Origin', rule: 'Rule 6(1)(aa)' },
    { key: 'net_quantity', title: 'Net Quantity', rule: 'Rule 6(1)(c)' },
    { key: 'mrp', title: 'Maximum Retail Price (MRP)', rule: 'Rule 6(1)(e)' },
    { key: 'date_of_manufacture_or_pack', title: 'Date of Mfg / Packing', rule: 'Rule 6(1)(d)' },
    { key: 'consumer_care_details', title: 'Consumer Care Details', rule: 'Rule 6(1)(f)' },
    { key: 'unit_sale_price', title: 'Unit Sale Price (USP)', rule: 'Rule 6(1)(g)' },
];

const isDeclarationPresent = (item = {}) => {
    const statusVal = item.missing || (item.present ? 'present' : 'missing');
    return statusVal === 'present';
};


const COLORS = {
    ink: '#101A2E',
    muted: '#47536B',
    faint: '#9099A8',
    accent: '#14532D',
    pass: '#16A34A',
    fail: '#DC2626',
    line: '#E4E7EC',
};

const formatStatus = (status) =>
    (status || 'Unknown').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (date) => (date ? new Date(date).toLocaleString('en-IN') : '—');

const fetchImageBuffer = async (image) => {
    try {
        if (image.annotatedImage && image.annotatedImage.startsWith('data:')) {
            const base64 = image.annotatedImage.split(',')[1];
            return Buffer.from(base64, 'base64');
        }
        if (image.url) {
            const res = await fetch(image.url);
            if (!res.ok) return null;
            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }
    } catch (err) {
        console.error('[PDF Report] Failed to load image:', err.message);
    }
    return null;
};

const keyValueLine = (doc, key, val) => {
    doc.fontSize(10).fillColor(COLORS.muted).font('Helvetica-Bold').text(`${key}: `, { continued: true });
    doc.fillColor(COLORS.ink).font('Helvetica').text(val || '—');
};

const sectionHeading = (doc, text) => {
    doc.moveDown(0.9);
    doc.fontSize(13).fillColor(COLORS.ink).font('Helvetica-Bold').text(text);
    doc.moveDown(0.3);
};

const divider = (doc) => {
    doc.moveDown(0.4);
    doc.strokeColor(COLORS.line).lineWidth(1)
        .moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.6);
};

export const generateComplaintReportPdf = async (complaint) => {
    const inspection = complaint.inspection && typeof complaint.inspection === 'object' ? complaint.inspection : null;
    const user = complaint.user && typeof complaint.user === 'object' ? complaint.user : null;
    const declarations = complaint.analysisSnapshot?.declarations || {};
    const complianceInfo = complaint.analysisSnapshot?.legal_metrology_2011_compliance || {};

    const presentCount = DECLARATION_META.filter((m) => isDeclarationPresent(declarations[m.key])).length; const missingCount = DECLARATION_META.length - presentCount;
    const isCompliant = complianceInfo?.is_fully_compliant;

    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const donePromise = new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });

    // ---------- HEADER ----------
    doc.fontSize(9).fillColor(COLORS.accent).font('Helvetica-Bold').text('LEGAL METROLOGY COMPLIANCE PLATFORM');
    doc.fontSize(18).fillColor(COLORS.ink).font('Helvetica-Bold').text('Inspection & Complaint Compliance Report');
    doc.moveDown(0.2);
    doc.fontSize(9.5).fillColor(COLORS.muted).font('Helvetica').text(`Generated: ${formatDate(new Date())}`);
    divider(doc);

    // ---------- CASE IDENTIFIERS ----------
    sectionHeading(doc, 'Case Identifiers');
    keyValueLine(doc, 'Complaint / Report ID', complaint.complaintId);
    keyValueLine(doc, 'Enforcement Case ID', complaint.enforcementCaseId || 'Not yet issued');
    keyValueLine(doc, 'Inspection ID', inspection?._id?.toString() || (typeof complaint.inspection === 'string' ? complaint.inspection : '—'));
    keyValueLine(doc, 'Inspection Date', formatDate(inspection?.createdAt));
    keyValueLine(doc, 'Complaint Submitted', formatDate(complaint.createdAt));
    keyValueLine(doc, 'Verified On', formatDate(complaint.verifiedAt));

    // ---------- PRODUCT INFORMATION ----------
    sectionHeading(doc, 'Product Information');
    keyValueLine(doc, 'Product Name', complaint.productName);
    keyValueLine(doc, 'Category', complaint.category);
    keyValueLine(doc, 'Manufacturer / Packer', declarations.manufacturer_details?.text || 'Not detected');
    keyValueLine(doc, 'Country of Origin', declarations.country_of_origin?.text || 'Not detected');
    keyValueLine(doc, 'MRP', declarations.mrp?.text || 'Not detected');
    keyValueLine(doc, 'Net Quantity', declarations.net_quantity?.text || 'Not detected');
    keyValueLine(doc, 'Manufacturing / Packing Date', declarations.date_of_manufacture_or_pack?.text || 'Not detected');
    keyValueLine(doc, 'Consumer Care Details', declarations.consumer_care_details?.text || 'Not detected');
    keyValueLine(doc, 'Unit Sale Price', declarations.unit_sale_price?.text || 'Not detected');

    // ---------- COMPLIANCE SUMMARY ----------
    sectionHeading(doc, 'Compliance Summary');
    doc.fontSize(10).fillColor(COLORS.muted).font('Helvetica-Bold').text('Overall Status: ', { continued: true });
    doc.fillColor(isCompliant ? COLORS.pass : COLORS.fail).font('Helvetica-Bold').text(isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT');
    doc.fontSize(10).fillColor(COLORS.muted).font('Helvetica').text(
        `Total declarations checked: ${DECLARATION_META.length}    Present: ${presentCount}    Missing: ${missingCount}`
    );
    if (complianceInfo?.confidence_score !== undefined) {
        doc.fontSize(10).fillColor(COLORS.muted).text(`AI Confidence Score: ${Math.round(complianceInfo.confidence_score * 100)}%`);
    }
    if (complianceInfo?.summary) {
        doc.moveDown(0.3);
        doc.fontSize(9.5).fillColor(COLORS.ink).font('Helvetica-Oblique').text(complianceInfo.summary);
    }

    // ---------- DECLARATION BREAKDOWN ----------
    sectionHeading(doc, 'Declaration-by-Declaration Breakdown');
    DECLARATION_META.forEach((meta) => {
        const item = declarations[meta.key] || {};
        const isPresent = isDeclarationPresent(item);

        doc.fontSize(10.5).fillColor(COLORS.ink).font('Helvetica-Bold').text(`${meta.title}  `, { continued: true });
        doc.fontSize(9).fillColor(COLORS.faint).font('Helvetica').text(`(${meta.rule})  `, { continued: true });
        doc.fontSize(9.5).fillColor(isPresent ? COLORS.pass : COLORS.fail).font('Helvetica-Bold').text(isPresent ? 'PRESENT' : 'MISSING');

        if (isPresent && item.text) {
            doc.fontSize(9.5).fillColor(COLORS.muted).font('Helvetica').text(`Detected text: "${item.text}"`);
        }
        if (!isPresent) {
            const reason = item.why_missing || item.missing_summary || `Mandatory declaration under ${meta.rule} is missing or incomplete.`;
            doc.fontSize(9.5).fillColor(COLORS.muted).font('Helvetica').text(`Reason: ${reason}`);
            if (item.likely_reason) {
                doc.fontSize(9).fillColor(COLORS.faint).font('Helvetica-Oblique').text(`Recommendation: ${item.likely_reason}`);
            }
        }
        doc.moveDown(0.5);
    });

    // ---------- VIOLATIONS CITED ----------
    if (complaint.violations?.length) {
        sectionHeading(doc, `Violations Cited in Complaint (${complaint.violations.length})`);
        complaint.violations.forEach((v) => {
            doc.fontSize(10).fillColor(COLORS.ink).font('Helvetica-Bold').text(`${v.title} (${v.rule})`);
            doc.fontSize(9.5).fillColor(COLORS.muted).font('Helvetica').text(v.reason || '—');
            doc.moveDown(0.3);
        });
    }

    // ---------- USER DESCRIPTION ----------
    sectionHeading(doc, 'User Complaint Description');
    doc.fontSize(10.5).fillColor(COLORS.ink).font('Helvetica').text(
        complaint.description || 'No additional description provided by the user.'
    );

    // ---------- ADMIN VERIFICATION ----------
    sectionHeading(doc, 'Admin Verification');
    keyValueLine(doc, 'Submitted By', user ? `${user.fullName || '—'} (${user.email || '—'})` : '—');
    keyValueLine(doc, 'Current Status', formatStatus(complaint.status));
    keyValueLine(doc, 'Verified On', formatDate(complaint.verifiedAt));
    keyValueLine(doc, 'Enforcement Case ID', complaint.enforcementCaseId || 'Not yet issued');
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor(COLORS.faint).font('Helvetica-Bold').text('ADMIN REMARKS');
    doc.moveDown(0.1);
    doc.fontSize(10.5).fillColor(COLORS.ink).font('Helvetica').text(complaint.adminRemarks || 'No remarks recorded.');

    // ---------- EVIDENCE IMAGES ----------
    if (complaint.images?.length) {
        doc.addPage();
        sectionHeading(doc, 'Evidence — Product Images');

        for (const img of complaint.images) {
            const buffer = await fetchImageBuffer(img);
            doc.fontSize(9.5).fillColor(COLORS.muted).font('Helvetica-Bold').text(img.view || 'Image');
            doc.moveDown(0.2);
            if (buffer) {
                try {
                    const imgWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
                    doc.image(buffer, { fit: [imgWidth, 320], align: 'left' });
                } catch (err) {
                    doc.fontSize(9).fillColor(COLORS.faint).text('(Image could not be rendered)');
                }
            } else {
                doc.fontSize(9).fillColor(COLORS.faint).text('(Image unavailable)');
            }
            doc.moveDown(0.6);
        }
    }

    // ---------- DISCLAIMER ----------
    doc.addPage();
    sectionHeading(doc, 'Important Note');
    doc.fontSize(9.5).fillColor(COLORS.muted).font('Helvetica').text(
        'This report is generated by an AI-assisted Legal Metrology compliance platform for evidentiary and administrative reference. ' +
        "AI-derived findings are assistive in nature; the compliance determination and any enforcement action reflect the reviewing officer's verification. " +
        'This document does not itself constitute a legal filing or court submission.'
    );

    doc.end();
    return donePromise;
};