export interface FormulaEvidence {
  formula: string;
  source: string;
  chapter: string;
  originalText: string;
  keySymptoms: string[];
  mechanism: string;
  treatmentMethod: string;
  indications: string[];
  contraindications: string[];
  dosage: string;
  instructions: string;
}

export interface FormulaMatchResult {
  formula: FormulaEvidence;
  matchScore: number;
}
