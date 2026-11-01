export type ReceiptClassification = 
  | 'SUCCESS'
  | 'USER_ERROR'
  | 'UNDETERMINED'
  | 'FAILED';

export interface ReceiptCheckResult {
  isSuccess: boolean;
  classification: ReceiptClassification;
  summary: string;
  decodedError?: string;
  statusName: string;
  resultName: string;
  leaderExecutionResult?: string;
}

export function decodeLeaderPayload(receipt: any): string {
  const payload = receipt?.consensus_data?.leader_receipt?.[0]?.result?.payload;
  if (!payload) return '';
  try {
    return atob(payload);
  } catch {
    return String(payload);
  }
}

export function classifyReceipt(receipt: any): ReceiptCheckResult {
  const statusName = receipt?.status_name || receipt?.status || 'UNKNOWN';
  const resultName = receipt?.result_name || receipt?.result || 'UNKNOWN';
  const leaderRes = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
  const decodedErr = decodeLeaderPayload(receipt);

  const isStatusAcceptedOrFinalized = statusName === 'ACCEPTED' || statusName === 'FINALIZED';
  const isMajorityAgree = resultName === 'MAJORITY_AGREE';
  const isLeaderSuccess = leaderRes === 'SUCCESS';

  if (isStatusAcceptedOrFinalized && isMajorityAgree && isLeaderSuccess) {
    return {
      isSuccess: true,
      classification: 'SUCCESS',
      summary: 'Transaction executed successfully with validator consensus.',
      statusName,
      resultName,
      leaderExecutionResult: leaderRes,
    };
  }

  if (statusName === 'UNDETERMINED' || resultName === 'MAJORITY_DISAGREE') {
    return {
      isSuccess: false,
      classification: 'UNDETERMINED',
      summary: 'No change: the state was not updated (validator consensus undetermined).',
      decodedError: decodedErr,
      statusName,
      resultName,
      leaderExecutionResult: leaderRes,
    };
  }

  if (leaderRes === 'ERROR') {
    return {
      isSuccess: false,
      classification: 'USER_ERROR',
      summary: decodedErr ? `Contract reverted: ${decodedErr}` : 'Transaction reverted by contract rule.',
      decodedError: decodedErr,
      statusName,
      resultName,
      leaderExecutionResult: leaderRes,
    };
  }

  return {
    isSuccess: false,
    classification: 'FAILED',
    summary: `Transaction failed with status: ${statusName}, result: ${resultName}`,
    decodedError: decodedErr,
    statusName,
    resultName,
    leaderExecutionResult: leaderRes,
  };
}
