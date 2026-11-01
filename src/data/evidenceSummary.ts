// Generated automatically by scripts/sync_evidence.mjs
// Do not edit manually.

export interface MetaHeader {
  source_repo: string;
  source_tag: string;
  source_commit: string;
  source_path: string;
  synced_at: string;
}

export interface BalanceSnapshot {
  step: string;
  underwriter: number;
  buyer: number;
  pool_balance: number;
  reserved: number;
  total_minted: number;
}

export interface TransactionEvidence {
  label: string;
  function: string;
  tx_hash: string;
  status_name: string;
  result_name: string;
  leader_result: string;
  error_payload?: string;
  latency_seconds: string;
  expected_success: boolean;
}

export interface RobustnessBatchResult {
  total: number;
  parsed: number;
  matches: number;
  pass: boolean;
}

export const EVIDENCE_META: MetaHeader = {
  source_repo: 'https://github.com/hypercybers99/cover-genlayer',
  source_tag: 'cover-v1-final',
  source_commit: 'de8ca897d2c0ad449facba25739f631292209e65',
  source_path: 'docs/evidence/live_evidence.json',
  synced_at: '2026-11-01T03:50:17.379Z',
};

export const PROMPT_SHA256 = '90be3b95dd867b8cc3a04f9464e3a1ab3b499343d3c4a40664042651092ecca1';

export const BALANCE_SNAPSHOTS: BalanceSnapshot[] = [
  {
    "step": "claim_underwriter",
    "underwriter": 1000,
    "buyer": 0,
    "pool_balance": 0,
    "reserved": 0,
    "total_minted": 1000
  },
  {
    "step": "claim_buyer",
    "underwriter": 1000,
    "buyer": 1000,
    "pool_balance": 0,
    "reserved": 0,
    "total_minted": 2000
  },
  {
    "step": "create_product",
    "underwriter": 1000,
    "buyer": 1000,
    "pool_balance": 0,
    "reserved": 0,
    "total_minted": 2000
  },
  {
    "step": "fund_product",
    "underwriter": 400,
    "buyer": 1000,
    "pool_balance": 600,
    "reserved": 0,
    "total_minted": 2000
  },
  {
    "step": "buy_Pa",
    "underwriter": 400,
    "buyer": 990,
    "pool_balance": 610,
    "reserved": 100,
    "total_minted": 2000
  },
  {
    "step": "buy_Pb",
    "underwriter": 400,
    "buyer": 980,
    "pool_balance": 620,
    "reserved": 200,
    "total_minted": 2000
  },
  {
    "step": "buy_Pc",
    "underwriter": 400,
    "buyer": 970,
    "pool_balance": 630,
    "reserved": 300,
    "total_minted": 2000
  },
  {
    "step": "buy_Pd",
    "underwriter": 400,
    "buyer": 960,
    "pool_balance": 640,
    "reserved": 400,
    "total_minted": 2000
  },
  {
    "step": "settle_Pa_PAY_100",
    "underwriter": 400,
    "buyer": 1060,
    "pool_balance": 540,
    "reserved": 300,
    "total_minted": 2000
  },
  {
    "step": "settle_Pb_PAY_50",
    "underwriter": 400,
    "buyer": 1110,
    "pool_balance": 490,
    "reserved": 200,
    "total_minted": 2000
  },
  {
    "step": "settle_Pc_PAY_25",
    "underwriter": 400,
    "buyer": 1135,
    "pool_balance": 465,
    "reserved": 100,
    "total_minted": 2000
  },
  {
    "step": "settle_Pd_NO_PAY_s3",
    "underwriter": 0,
    "buyer": 1135,
    "pool_balance": 465,
    "reserved": 100,
    "total_minted": 1600
  },
  {
    "step": "settle_Pd_NO_PAY_s5",
    "underwriter": 400,
    "buyer": 1135,
    "pool_balance": 465,
    "reserved": 100,
    "total_minted": 2000
  },
  {
    "step": "settle_Pd_REVIEW_s6",
    "underwriter": 400,
    "buyer": 1135,
    "pool_balance": 465,
    "reserved": 100,
    "total_minted": 2000
  },
  {
    "step": "settle_Pd_REVIEW_s7",
    "underwriter": 400,
    "buyer": 1135,
    "pool_balance": 465,
    "reserved": 100,
    "total_minted": 2000
  },
  {
    "step": "settle_Pd_PAGE_UNCHANGED",
    "underwriter": 400,
    "buyer": 1135,
    "pool_balance": 465,
    "reserved": 100,
    "total_minted": 2000
  },
  {
    "step": "cancel_Pd",
    "underwriter": 400,
    "buyer": 1135,
    "pool_balance": 465,
    "reserved": 0,
    "total_minted": 2000
  },
  {
    "step": "withdraw_50",
    "underwriter": 450,
    "buyer": 1135,
    "pool_balance": 415,
    "reserved": 0,
    "total_minted": 2000
  }
];

export const TRANSACTION_MATRIX: TransactionEvidence[] = [
  {
    "label": "claim_demo_credits_underwriter",
    "function": "claim_demo_credits",
    "tx_hash": "0xe92e705f332fc1e8924b4383a94a0ebff3e5628374c38cd3a66b0c307b5e1223",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.37",
    "expected_success": true
  },
  {
    "label": "claim_demo_credits_buyer",
    "function": "claim_demo_credits",
    "tx_hash": "0xc911a755f52614073204246cdbebf6e64918895e4c7a3b225271bd27c2c3d864",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.38",
    "expected_success": true
  },
  {
    "label": "create_product",
    "function": "create_product",
    "tx_hash": "0xca9107861586467463b2ec5be0451fd6d7acefaa143dcdc820ec0a5146256f0a",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.71",
    "expected_success": true
  },
  {
    "label": "fund_product",
    "function": "fund_product",
    "tx_hash": "0xd7f82413457853e627bb5e92104156b6acdca393f6e1bed7368c1e696e5ea53e",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.56",
    "expected_success": true
  },
  {
    "label": "buy_policy_Pa",
    "function": "buy",
    "tx_hash": "0x6c576550c13893ee45809289c076a306e9609c7becd3fc0cac20a3acb49ebca1",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "20.92",
    "expected_success": true
  },
  {
    "label": "buy_policy_Pb",
    "function": "buy",
    "tx_hash": "0x0313b0e12b6ad95a749b960933394d51cc6e69505c4476c58efe6d2172ffa20e",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "16.97",
    "expected_success": true
  },
  {
    "label": "buy_policy_Pc",
    "function": "buy",
    "tx_hash": "0x92d5c6186b97e6390e42bec6d2d7e6ae8d23228d07e8926f57600dd103d6a684",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.46",
    "expected_success": true
  },
  {
    "label": "buy_policy_Pd",
    "function": "buy",
    "tx_hash": "0x64db500b1767fffb157fa9c60be2a20dce3dcdfc709b5c57f564c9b6a986474e",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "13.29",
    "expected_success": true
  },
  {
    "label": "update_source_s8",
    "function": "update_source",
    "tx_hash": "0x6516e6f4846567fefb38b7f2a7aad44bdb859d46eff9963d6d12f6acc2bb4c5e",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.52",
    "expected_success": true
  },
  {
    "label": "buy_refused_s8",
    "function": "buy",
    "tx_hash": "0x578ac20a937ea0e4c32d55e841aeb98de7275489fa9439f0270b3b62d576e947",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "ERROR",
    "error_payload": "z����ky�r�zk�\n޲�+�֭�˧rW���i��!j�",
    "latency_seconds": "17.10",
    "expected_success": false
  },
  {
    "label": "update_source_s0",
    "function": "update_source",
    "tx_hash": "0x225eeddc8ab6e1310972146c32209ed2209cb38161bbd77357950ec493606a16",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.62",
    "expected_success": true
  },
  {
    "label": "guard_attest_Pa_before",
    "function": "attest",
    "tx_hash": "0x406c6f0b48a9a51fcda0d0f851823851e32662221f4e522618a301f8c25acb33",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.63",
    "expected_success": true
  },
  {
    "label": "update_source_s1",
    "function": "update_source",
    "tx_hash": "0xa8560112df9e87a6cf6ebb2e47e8116beca39f86a57a50934a26cad72af14c78",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.49",
    "expected_success": true
  },
  {
    "label": "settle_Pa_s1_PAY_100",
    "function": "settle",
    "tx_hash": "0xd3b080ddcb88ab3d1a4365cb3f0924e506451fe764f0413219850c428ea8d395",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "17.17",
    "expected_success": true
  },
  {
    "label": "update_source_s2",
    "function": "update_source",
    "tx_hash": "0xb85113485c9a2d44acd61e56167633a22920471f407f567b32c1440c475e907f",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.71",
    "expected_success": true
  },
  {
    "label": "settle_Pb_s2_PAY_50",
    "function": "settle",
    "tx_hash": "0xfe110b4523c9c7eccc3865a737c871167bbfc9b234177387dbb5f507dbe32198",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "20.81",
    "expected_success": true
  },
  {
    "label": "update_source_s4",
    "function": "update_source",
    "tx_hash": "0xc2f53540edda4df99b1d84d9f0b84bf600040b05d793410edbc7cbf9203a6ecb",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.64",
    "expected_success": true
  },
  {
    "label": "settle_Pc_s4_PAY_25",
    "function": "settle",
    "tx_hash": "0x802f3d3aa60cce8f22d0e45554c31b06b750d20921459bb30f021e520b7d0130",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "13.32",
    "expected_success": true
  },
  {
    "label": "update_source_s3",
    "function": "update_source",
    "tx_hash": "0xc072a383e992f809243eea19b7d999dee737dd7ee18a4679f63e0ca59b0d2b09",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.52",
    "expected_success": true
  },
  {
    "label": "settle_Pd_s3_NO_PAY",
    "function": "settle",
    "tx_hash": "0x5561defaf8ee9fdadc1ba61d37de7fa5902679ca97d1deba4b692854fa983054",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "13.36",
    "expected_success": true
  },
  {
    "label": "update_source_s5",
    "function": "update_source",
    "tx_hash": "0xb0e785081822f961cfe32c56ce4d5665ad0692aa344c3629dc67b7804e6a24d0",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.52",
    "expected_success": true
  },
  {
    "label": "settle_Pd_s5_NO_PAY",
    "function": "settle",
    "tx_hash": "0x0feb08c5220585f10390fcee90a4e93dabc4d5ee48d52463be3dbd23bc0c5a5e",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "16.99",
    "expected_success": true
  },
  {
    "label": "update_source_s6",
    "function": "update_source",
    "tx_hash": "0x4e5c09b6f82f10260d97f148fe837f6ee631e3900e4edef7f1401ae9227fe50b",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.46",
    "expected_success": true
  },
  {
    "label": "settle_Pd_s6_REVIEW_tripwire",
    "function": "settle",
    "tx_hash": "0x0335bd4704b713b421abf1a95a6990ed7a9b3b5bf42794ed0e063349bc8516e5",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "17.01",
    "expected_success": true
  },
  {
    "label": "update_source_s7",
    "function": "update_source",
    "tx_hash": "0x705028b673d14867802568fcea147ec825eee185f6ae359713bca06a5397950d",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.53",
    "expected_success": true
  },
  {
    "label": "settle_Pd_s7_REVIEW_no_duration",
    "function": "settle",
    "tx_hash": "0x8ec2f35633ff26d029c7b624382863305a7572cfe1161cb1060c8e9c807b94fc",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "13.39",
    "expected_success": true
  },
  {
    "label": "update_source_s0_again",
    "function": "update_source",
    "tx_hash": "0x7aaea28af5374527f157380b54f7b238c86e79427ea1291ff69a6ff121f4f7d6",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.45",
    "expected_success": true
  },
  {
    "label": "settle_Pd_s0_PAGE_UNCHANGED",
    "function": "settle",
    "tx_hash": "0x5eaeca207649e0079b9b70fac6bdcbed052a6b4fe24839879921c016ad1cee5e",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.45",
    "expected_success": true
  },
  {
    "label": "settle_Pd_duplicate_observation",
    "function": "settle",
    "tx_hash": "0x570c5b96e5ec28e50907140892cabb613c1b78a4de8ba157d50112827efa504b",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "ERROR",
    "error_payload": "v�e�ƭz��z�ڶ*'",
    "latency_seconds": "9.52",
    "expected_success": false
  },
  {
    "label": "update_source_404",
    "function": "update_source",
    "tx_hash": "0x1e3b38fc5ca963c1e2b606643dc495c3df5e232fcfe83abd54becc8afa0295b1",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.69",
    "expected_success": true
  },
  {
    "label": "settle_404_error",
    "function": "settle",
    "tx_hash": "0x1711e6c7a4c3713e93cc366ac6760c46028bbb6c442a9d911b3b018814eb3390",
    "status_name": "UNDETERMINED",
    "result_name": "MAJORITY_DISAGREE",
    "leader_result": "ERROR",
    "error_payload": "\u001d4ϲ֭���m4�N",
    "latency_seconds": "51.43",
    "expected_success": false
  },
  {
    "label": "update_source_s9",
    "function": "update_source",
    "tx_hash": "0x52a33f1699763721fc762c6fe778f71968fa84693e9f3a5e5d33275475e07d7e",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "9.33",
    "expected_success": true
  },
  {
    "label": "settle_s9_too_short",
    "function": "settle",
    "tx_hash": "0xf175fdf1898ee6d224f1a65083c516866fbd4f279cd2f22b5a2aff77892c4dde",
    "status_name": "UNDETERMINED",
    "result_name": "MAJORITY_DISAGREE",
    "leader_result": "ERROR",
    "error_payload": "��\u001e�z�i֛�",
    "latency_seconds": "20.82",
    "expected_success": false
  },
  {
    "label": "update_source_mismatch",
    "function": "update_source",
    "tx_hash": "0x7263927d2916767531a7d6336f1dd096129f2a54007d7d0e611d23cfdb1f79f8",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "ERROR",
    "error_payload": "��-��b��-����ɚ��h��]j׿���q",
    "latency_seconds": "9.43",
    "expected_success": false
  },
  {
    "label": "restore_source_s0",
    "function": "update_source",
    "tx_hash": "0x48abe2104945bc204a99abd7f2c5a52967398cd6d28bf14f7bb6d030fc1c911b",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.56",
    "expected_success": true
  },
  {
    "label": "cancel_policy_Pd",
    "function": "cancel",
    "tx_hash": "0x98a4e82c54113dac6fe1b8c7c26c351b1f6ff8614f3dfa91f9a4f5a1a50dd807",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.61",
    "expected_success": true
  },
  {
    "label": "withdraw_unreserved",
    "function": "withdraw_unreserved",
    "tx_hash": "0x972bca48e082540ff7893bad40202ca0d8b7e83930c7fcc3ee91dd2b4f9539bf",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "SUCCESS",
    "error_payload": "[object Object]",
    "latency_seconds": "5.54",
    "expected_success": true
  },
  {
    "label": "withdraw_over_unreserved",
    "function": "withdraw_unreserved",
    "tx_hash": "0x021bc24260223f7207dc63084acd9e9f03c21109730fc322f2a9a4cdd4439a9d",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "ERROR",
    "error_payload": "�+av��{\u0017\u001ey�.���z��",
    "latency_seconds": "9.34",
    "expected_success": false
  },
  {
    "label": "guard_attest_Pa_paid_error",
    "function": "attest",
    "tx_hash": "0xc5468ec358e70ea98e2a9e7de4a953171400818c48f8fa260adb08874223ecdf",
    "status_name": "ACCEPTED",
    "result_name": "MAJORITY_AGREE",
    "leader_result": "ERROR",
    "error_payload": "��\\���y�� ",
    "latency_seconds": "5.47",
    "expected_success": false
  }
];

export const ITER2_BATCHES: Record<string, RobustnessBatchResult> = {
  "s1": {
    "total": 10,
    "parsed": 10,
    "matches": 10,
    "pass": true
  },
  "s2": {
    "total": 10,
    "parsed": 10,
    "matches": 10,
    "pass": true
  },
  "s3": {
    "total": 10,
    "parsed": 10,
    "matches": 10,
    "pass": true
  },
  "s4": {
    "total": 10,
    "parsed": 9,
    "matches": 9,
    "pass": false
  },
  "s5": {
    "total": 10,
    "parsed": 10,
    "matches": 10,
    "pass": true
  },
  "s7": {
    "total": 10,
    "parsed": 10,
    "matches": 10,
    "pass": true
  },
  "s4_rerun": {
    "total": 10,
    "parsed": 10,
    "matches": 10,
    "pass": true
  }
};

export const FINAL_STATS = {
  "next_policy": "5",
  "next_product": "2",
  "next_settlement": "9",
  "schema_version": "1",
  "total_minted": "2000"
};
export const FINAL_POOL_HEALTH = {
  "coverage_ratio_bps": "10000",
  "free": "415",
  "pool_balance": "415",
  "product_id": "1",
  "reserved": "0",
  "schema_version": "1"
};
