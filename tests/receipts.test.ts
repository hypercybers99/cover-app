import { describe, it, expect } from 'vitest';
import { classifyReceipt } from '../src/lib/receipts';

describe('Receipt Classification Combinations', () => {
  const cases = [
    {
      status_name: 'ACCEPTED',
      result_name: 'MAJORITY_AGREE',
      leader_res: 'SUCCESS',
      expectedClass: 'SUCCESS',
      expectedSuccess: true,
    },
    {
      status_name: 'FINALIZED',
      result_name: 'MAJORITY_AGREE',
      leader_res: 'SUCCESS',
      expectedClass: 'SUCCESS',
      expectedSuccess: true,
    },
    {
      status_name: 'ACCEPTED',
      result_name: 'MAJORITY_AGREE',
      leader_res: 'ERROR',
      expectedClass: 'USER_ERROR',
      expectedSuccess: false,
    },
    {
      status_name: 'UNDETERMINED',
      result_name: 'MAJORITY_DISAGREE',
      leader_res: 'ERROR',
      expectedClass: 'UNDETERMINED',
      expectedSuccess: false,
    },
    {
      status_name: 'UNDETERMINED',
      result_name: 'MAJORITY_AGREE',
      leader_res: 'SUCCESS',
      expectedClass: 'UNDETERMINED',
      expectedSuccess: false,
    },
    {
      status_name: 'ACCEPTED',
      result_name: 'MAJORITY_DISAGREE',
      leader_res: 'SUCCESS',
      expectedClass: 'UNDETERMINED',
      expectedSuccess: false,
    },
    {
      status_name: 'PENDING',
      result_name: 'PENDING',
      leader_res: undefined,
      expectedClass: 'FAILED',
      expectedSuccess: false,
    },
    {
      status_name: 'PROPOSING',
      result_name: 'NO_MAJORITY',
      leader_res: undefined,
      expectedClass: 'FAILED',
      expectedSuccess: false,
    },
  ];

  for (const c of cases) {
    it(`correctly classifies status=${c.status_name}, result=${c.result_name}, leader=${c.leader_res}`, () => {
      const mockReceipt = {
        status_name: c.status_name,
        result_name: c.result_name,
        consensus_data: {
          leader_receipt: c.leader_res ? [{ execution_result: c.leader_res }] : [],
        },
      };
      const res = classifyReceipt(mockReceipt);
      expect(res.classification).toBe(c.expectedClass);
      expect(res.isSuccess).toBe(c.expectedSuccess);
    });
  }
});
