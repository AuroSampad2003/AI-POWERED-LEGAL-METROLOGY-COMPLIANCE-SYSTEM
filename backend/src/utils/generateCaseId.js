import Complaint from '../models/Complaint.js';

const generateEnforcementCaseId = async () => {
    const year = new Date().getFullYear();
    const existingCount = await Complaint.countDocuments({ enforcementCaseId: { $exists: true } });

    let seq = existingCount + 1;
    let candidate = `LM-CASE-${year}-${String(seq).padStart(4, '0')}`;

    // Safety net in case of a race condition producing a duplicate
    // eslint-disable-next-line no-await-in-loop
    while (await Complaint.exists({ enforcementCaseId: candidate })) {
        seq += 1;
        candidate = `LM-CASE-${year}-${String(seq).padStart(4, '0')}`;
    }

    return candidate;
};

export default generateEnforcementCaseId;