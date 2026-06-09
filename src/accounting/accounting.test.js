const {
  dataProgram,
  viewBalanceMessage,
  creditAccount,
  debitAccount,
  resetStorageBalance,
} = require('./index');

describe('COBOL parity test plan for accounting app', () => {
  beforeEach(() => {
    resetStorageBalance();
  });

  test('TC-001: launch baseline state is initialized', () => {
    expect(dataProgram('READ')).toBe(1000);
  });

  test('TC-002: view initial balance before transactions', () => {
    expect(viewBalanceMessage()).toBe('Current balance: 001000.00');
  });

  test('TC-003: credit account with valid amount', () => {
    const message = creditAccount('200.00');
    expect(message).toBe('Amount credited. New balance: 001200.00');
    expect(dataProgram('READ')).toBeCloseTo(1200.0, 2);
  });

  test('TC-004: debit account with sufficient funds', () => {
    const message = debitAccount('100.00');
    expect(message).toBe('Amount debited. New balance: 000900.00');
    expect(dataProgram('READ')).toBeCloseTo(900.0, 2);
  });

  test('TC-005: debit with insufficient funds does not change balance', () => {
    const before = dataProgram('READ');
    const message = debitAccount('999999.99');
    const after = dataProgram('READ');

    expect(message).toBe('Insufficient funds for this debit.');
    expect(after).toBe(before);
  });

  test('TC-006: invalid menu option has no business-operation side effect', () => {
    const before = dataProgram('READ');
    const unsupported = dataProgram('UNKNWN');
    const after = dataProgram('READ');

    expect(unsupported).toBeUndefined();
    expect(after).toBe(before);
  });

  test('TC-007: exit behavior represented by no additional state mutation', () => {
    const before = dataProgram('READ');
    const after = dataProgram('READ');
    expect(after).toBe(before);
  });

  test('TC-008: balance persists across credit then debit in same run', () => {
    creditAccount('50.00');
    debitAccount('20.00');
    expect(viewBalanceMessage()).toBe('Current balance: 001030.00');
  });

  test('TC-009: zero credit leaves balance unchanged', () => {
    const before = dataProgram('READ');
    const message = creditAccount('0.00');
    const after = dataProgram('READ');

    expect(message).toBe('Amount credited. New balance: 001000.00');
    expect(after).toBe(before);
  });

  test('TC-010: zero debit leaves balance unchanged', () => {
    const before = dataProgram('READ');
    const message = debitAccount('0.00');
    const after = dataProgram('READ');

    expect(message).toBe('Amount debited. New balance: 001000.00');
    expect(after).toBe(before);
  });

  test('TC-011: negative credit runtime behavior is documented', () => {
    const message = creditAccount('-50.00');
    expect(message).toBe('Amount credited. New balance: 000950.00');
    expect(dataProgram('READ')).toBeCloseTo(950.0, 2);
  });

  test('TC-012: negative debit runtime behavior is documented', () => {
    const message = debitAccount('-50.00');
    expect(message).toBe('Amount debited. New balance: 001050.00');
    expect(dataProgram('READ')).toBeCloseTo(1050.0, 2);
  });

  test('TC-013: boundary and out-of-shape values are accepted in current node runtime', () => {
    const inShape = creditAccount('999999.99');
    expect(inShape).toBe('Amount credited. New balance: 1000999.99');

    resetStorageBalance();
    const outOfShape = creditAccount('1000000.00');
    expect(outOfShape).toBe('Amount credited. New balance: 1001000.00');
  });

  test('TC-014: read consistency after write operations', () => {
    creditAccount('25.00');
    expect(viewBalanceMessage()).toBe('Current balance: 001025.00');

    debitAccount('10.00');
    expect(viewBalanceMessage()).toBe('Current balance: 001015.00');
  });

  test('TC-015: repeated operations keep state until explicit reset/exit', () => {
    viewBalanceMessage();
    creditAccount('10.00');
    debitAccount('5.00');
    expect(dataProgram('READ')).toBeCloseTo(1005.0, 2);
  });
});
