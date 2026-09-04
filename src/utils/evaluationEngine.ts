export type ExceptionType = 
  | 'none' 
  | 'amount_mismatch' 
  | 'missing_settlement' 
  | 'missing_payment' 
  | 'duplicate' 
  | 'timing_difference' 
  | 'refund';

export interface GroundTruth {
  transactionId: string;
  isException: boolean;
  exceptionType: ExceptionType;
}

export interface SystemPrediction {
  transactionId: string;
  isException: boolean;
  predictedType: ExceptionType;
}

export interface ConfusionMatrix {
  truePositives: number; // TP
  falsePositives: number; // FP
  trueNegatives: number; // TN
  falseNegatives: number; // FN
}

export interface ClassificationMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: ConfusionMatrix;
}

export interface OverallEvaluation {
  detectionMetrics: ClassificationMetrics;
  classificationAccuracy: number;
  perClassMetrics: Record<string, ClassificationMetrics>;
}

/**
 * Calculates Precision: True Positives / (True Positives + False Positives)
 * Of all detected exceptions, how many were actually exceptions?
 */
export function calculatePrecision(tp: number, fp: number): number {
  if (tp + fp === 0) return 0;
  return tp / (tp + fp);
}

/**
 * Calculates Recall: True Positives / (True Positives + False Negatives)
 * Of all true exceptions, how many did the system successfully detect?
 */
export function calculateRecall(tp: number, fn: number): number {
  if (tp + fn === 0) return 0;
  return tp / (tp + fn);
}

/**
 * Calculates F1 Score: 2 * (Precision * Recall) / (Precision + Recall)
 * Harmonic mean of precision and recall.
 */
export function calculateF1(precision: number, recall: number): number {
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

/**
 * Generates the Confusion Matrix for binary exception detection (Is Exception vs. Normal)
 */
export function generateConfusionMatrix(truths: GroundTruth[], predictions: SystemPrediction[]): ConfusionMatrix {
  let tp = 0, fp = 0, tn = 0, fn = 0;

  // Assuming truths and predictions are ordered the same or mapped by transactionId
  const predMap = new Map(predictions.map(p => [p.transactionId, p]));

  for (const truth of truths) {
    const pred = predMap.get(truth.transactionId);
    if (!pred) continue; // Skip if no prediction found for the truth

    if (truth.isException && pred.isException) tp++;
    else if (!truth.isException && pred.isException) fp++;
    else if (!truth.isException && !pred.isException) tn++;
    else if (truth.isException && !pred.isException) fn++;
  }

  return { truePositives: tp, falsePositives: fp, trueNegatives: tn, falseNegatives: fn };
}

/**
 * Calculates how accurately the system classifies the *type* of exception,
 * given that it correctly identified an exception exists (True Positives).
 */
export function calculateExceptionClassificationAccuracy(truths: GroundTruth[], predictions: SystemPrediction[]): number {
  const predMap = new Map(predictions.map(p => [p.transactionId, p]));
  
  let correctlyClassified = 0;
  let totalTruePositives = 0;

  for (const truth of truths) {
    const pred = predMap.get(truth.transactionId);
    if (!pred) continue;

    // Only evaluate classification accuracy on True Positives
    if (truth.isException && pred.isException) {
      totalTruePositives++;
      if (truth.exceptionType === pred.predictedType) {
        correctlyClassified++;
      }
    }
  }

  if (totalTruePositives === 0) return 0;
  return correctlyClassified / totalTruePositives;
}

/**
 * Main function to evaluate the entire reconciliation engine run.
 */
export function evaluateSystem(truths: GroundTruth[], predictions: SystemPrediction[]): OverallEvaluation {
  // 1. Overall Binary Detection Metrics
  const cm = generateConfusionMatrix(truths, predictions);
  const precision = calculatePrecision(cm.truePositives, cm.falsePositives);
  const recall = calculateRecall(cm.truePositives, cm.falseNegatives);
  const f1Score = calculateF1(precision, recall);

  // 2. Multi-class Classification Accuracy
  const classificationAccuracy = calculateExceptionClassificationAccuracy(truths, predictions);

  // 3. Per-Class Metrics (e.g., how good are we at detecting 'amount_mismatch' specifically?)
  const exceptionTypes: ExceptionType[] = [
    'amount_mismatch', 'missing_settlement', 'missing_payment', 
    'duplicate', 'timing_difference', 'refund'
  ];
  
  const perClassMetrics: Record<string, ClassificationMetrics> = {};
  const predMap = new Map(predictions.map(p => [p.transactionId, p]));

  for (const type of exceptionTypes) {
    let typeTp = 0, typeFp = 0, typeTn = 0, typeFn = 0;

    for (const truth of truths) {
      const pred = predMap.get(truth.transactionId);
      if (!pred) continue;

      const isTruthThisType = truth.exceptionType === type;
      const isPredThisType = pred.predictedType === type;

      if (isTruthThisType && isPredThisType) typeTp++;
      else if (!isTruthThisType && isPredThisType) typeFp++;
      else if (!isTruthThisType && !isPredThisType) typeTn++;
      else if (isTruthThisType && !isPredThisType) typeFn++;
    }

    const typePrecision = calculatePrecision(typeTp, typeFp);
    const typeRecall = calculateRecall(typeTp, typeFn);
    
    perClassMetrics[type] = {
      precision: typePrecision,
      recall: typeRecall,
      f1Score: calculateF1(typePrecision, typeRecall),
      confusionMatrix: {
        truePositives: typeTp,
        falsePositives: typeFp,
        trueNegatives: typeTn,
        falseNegatives: typeFn
      }
    };
  }

  return {
    detectionMetrics: {
      precision,
      recall,
      f1Score,
      confusionMatrix: cm
    },
    classificationAccuracy,
    perClassMetrics
  };
}

// ============================================================================
// UNIT TESTS & EXAMPLE USAGE
// ============================================================================
export function runEvaluationTests() {
  console.log("Running Evaluation Engine Tests...");

  const mockTruths: GroundTruth[] = [
    { transactionId: "T1", isException: false, exceptionType: "none" }, // TN
    { transactionId: "T2", isException: true, exceptionType: "missing_payment" }, // TP, Correct Class
    { transactionId: "T3", isException: true, exceptionType: "amount_mismatch" }, // TP, Wrong Class
    { transactionId: "T4", isException: true, exceptionType: "duplicate" }, // FN
    { transactionId: "T5", isException: false, exceptionType: "none" } // FP
  ];

  const mockPreds: SystemPrediction[] = [
    { transactionId: "T1", isException: false, predictedType: "none" },
    { transactionId: "T2", isException: true, predictedType: "missing_payment" },
    { transactionId: "T3", isException: true, predictedType: "timing_difference" }, // Wrong classification
    { transactionId: "T4", isException: false, predictedType: "none" }, // Missed exception
    { transactionId: "T5", isException: true, predictedType: "amount_mismatch" } // False alarm
  ];

  const results = evaluateSystem(mockTruths, mockPreds);
  
  console.log("Overall Detection Metrics:");
  console.log(`- Precision: ${results.detectionMetrics.precision.toFixed(2)} (Expected 0.67)`);
  console.log(`- Recall: ${results.detectionMetrics.recall.toFixed(2)} (Expected 0.67)`);
  console.log(`- F1 Score: ${results.detectionMetrics.f1Score.toFixed(2)} (Expected 0.67)`);
  console.log(`- Confusion Matrix:`, results.detectionMetrics.confusionMatrix);
  console.log(`\nClassification Accuracy: ${results.classificationAccuracy.toFixed(2)} (Expected 0.50)`);
  
  return results;
}
