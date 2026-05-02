const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Aaroh backend is running!' });
});

app.post('/api/extract', upload.single('pdf'), async (req, res) => {
  const pdfPath = req.file?.path;
  if (!pdfPath) return res.status(400).json({ error: "No PDF uploaded" });

  try {
    const pdfData = fs.readFileSync(pdfPath);
    const base64PDF = pdfData.toString('base64');

    const prompt = `You are an expert Indian Legal Clerk with deep knowledge of Karnataka High Court judgment structures. Analyze this court judgment with surgical precision.

### CRITICAL EXTRACTION ZONES:
1. **HEADER SECTION** (First 2-3 pages):
   - Case number format: WP/[number]/[year] or WA/[number]/[year] or CRL.P/[number]/[year]
   - Court name: "High Court of Karnataka at Bengaluru" or similar
   - Parties: Look for "BETWEEN:" followed by petitioner name, then "AND:" or "Vs." followed by respondent
   - Order date: Look for "DATED THIS THE" or date at end of judgment

2. **OPERATIVE ORDER SECTION** (Usually last 1-3 pages):
   Focus HEAVILY on text following these exact phrases:
   - "In view of the above,"
   - "Accordingly,"
   - "Hence the following directions are issued:"
   - "The writ petition is disposed of with the following directions:"
   - "Resultantly,"
   - "In the result,"
   - "For the aforesaid reasons,"
   
   THIS IS WHERE ACTIONABLE DIRECTIONS LIVE. Extract EVERY sentence in this section.

3. **ORDER TYPE DETECTION**:
   - INTERIM: Contains phrases like "till next date", "subject to further orders", "stay granted", "interim relief", "status quo"
   - FINAL_DISPOSAL: Contains "disposed of", "allowed", "dismissed", "petition stands disposed"

### DIRECTION CLASSIFICATION LOGIC:

**BINDING_TO_GOVT** - Use this when direction:
- Orders any government entity (State, Department, Officer, Authority, Corporation, Board, Commission)
- Uses mandatory language: "shall", "must", "directed to", "ordered to"
- Examples:
  * "The State shall reconsider the application within 30 days"
  * "The respondent authorities are directed to issue the NOC"
  * "The Tahsildar is ordered to conduct an inquiry"
  * ANY direction to respondents numbered R1, R2, R3 when they are government entities

**TO_PETITIONER** - Use when direction:
- Orders the petitioner or private party to do something
- Examples:
  * "The petitioner shall submit revised application"
  * "The writ petitioner may approach the competent authority"
  
**OBSERVATION** - Use when text is:
- Judicial commentary without actionable mandate
- Expressions of hope or expectation
- General legal principles stated
- Examples:
  * "It is expected that such delays will not recur"
  * "We observe that the procedure was not followed"
  * "This Court is of the view that..."

### TIMELINE EXTRACTION RULES:
- **Explicit deadlines**: "within 30 days", "within two weeks", "within 3 months from today"
- **Vague deadlines**: "forthwith", "immediately", "as expeditiously as possible", "at the earliest", "without delay"
  → For vague deadlines, set calculated_deadline_days to 30 (internal compliance standard)
- **No deadline**: "may consider", "is at liberty to" → set calculated_deadline_days to null
- **Calculate from**: Always from order date unless specifically says "from date of application" or "from receipt of notice"

### RESPONSIBLE ENTITY IDENTIFICATION:
- Look for specific designations: "Tahsildar", "Deputy Commissioner", "Chief Secretary", "Commissioner of Police"
- Look for department names: "Revenue Department", "Transport Department", "Urban Development Authority"
- Extract respondent numbers if applicable: "R1", "R2 (Deputy Commissioner, Bangalore Urban)"
- If direction says "respondents" generally, mark as "Respondent Authorities (State of Karnataka)"

### APPEAL LIMITATION PERIOD:
- High Court to Supreme Court: 90 days from order date (for SLP under Article 136)
- District/Subordinate Court to High Court: 30 days for most matters
- If interim order: mention "Subject to appeal/modification"

### OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no code blocks):

{
  "case_metadata": {
    "case_number": "string",
    "order_date": "DD-MM-YYYY",
    "court_name": "High Court of Karnataka at Bengaluru",
    "order_type": "INTERIM" or "FINAL_DISPOSAL",
    "parties": {
      "petitioner": "Full name of petitioner",
      "respondent": "Full name of respondent(s)"
    }
  },
  "directions": [
    {
      "verbatim_text": "Exact text of direction from judgment",
      "category": "BINDING_TO_GOVT" or "TO_PETITIONER" or "OBSERVATION",
      "responsible_entity": "Specific officer/department name or null",
      "original_timeline": "Exact timeline phrase from judgment or null",
      "calculated_deadline_days": number or null,
      "confidence_score": "HIGH" or "MEDIUM" or "LOW"
    }
  ],
  "appeal_limitation": "90 days to Supreme Court" or "30 days as per statute" or "Subject to interim modification"
}

### CONFIDENCE SCORING:
- HIGH: Direction is crystal clear, uses "shall"/"must", timeline is explicit, entity is named
- MEDIUM: Direction is clear but timeline is vague OR entity not specifically named
- LOW: Direction is ambiguous, uses permissive language ("may"), or buried in complex legalese

Extract ALL directions from the operative order section. Do not skip any. Even observations should be captured.`;

   const model = genAI.getGenerativeModel({ 
  model: 'models/gemini-2.5-flash'
});
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64PDF
        }
      }
    ]);

    const responseText = result.response.text();
    console.log('Raw Gemini response:', responseText);

    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const extractedData = JSON.parse(cleanedResponse);

    const summary = {
      total_directions: extractedData.directions.length,
      binding_to_govt: extractedData.directions.filter(d => d.category === 'BINDING_TO_GOVT').length,
      to_petitioner: extractedData.directions.filter(d => d.category === 'TO_PETITIONER').length,
      observations: extractedData.directions.filter(d => d.category === 'OBSERVATION').length,
      high_confidence: extractedData.directions.filter(d => d.confidence_score === 'HIGH').length,
      requires_immediate_action: extractedData.directions.filter(d => 
        d.category === 'BINDING_TO_GOVT' && 
        d.calculated_deadline_days !== null && 
        d.calculated_deadline_days <= 30
      ).length
    };

    fs.unlinkSync(pdfPath);

    res.json({
      success: true,
      data: extractedData,
      summary: summary
    });

  } catch (error) {
    if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    console.error('Extraction Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to parse legal document."
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Aaroh Server running on http://localhost:${PORT}`);
  console.log('Ready to process court judgments.');
});