const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

// DataProgram equivalent: in-memory storage for a single account balance.
let storageBalance = 1000.0;

function resetStorageBalance() {
  storageBalance = 1000.0;
}

function dataProgram(passedOperation, balance) {
  const operationType = passedOperation;

  if (operationType === 'READ') {
    return storageBalance;
  }

  if (operationType === 'WRITE') {
    storageBalance = balance;
  }

  return undefined;
}

function formatCobolBalance(value) {
  const normalized = Number.isFinite(value) ? value : 0;
  const [integerPart, decimalPart] = normalized.toFixed(2).split('.');
  return `${integerPart.padStart(6, '0')}.${decimalPart}`;
}

function viewBalanceMessage() {
  const finalBalance = dataProgram('READ');
  return `Current balance: ${formatCobolBalance(finalBalance)}`;
}

function creditAccount(amountInput) {
  const amount = Number.parseFloat(amountInput) || 0;
  const finalBalance = dataProgram('READ') + amount;
  dataProgram('WRITE', finalBalance);
  return `Amount credited. New balance: ${formatCobolBalance(finalBalance)}`;
}

function debitAccount(amountInput) {
  const amount = Number.parseFloat(amountInput) || 0;
  const finalBalance = dataProgram('READ');

  if (finalBalance >= amount) {
    const updatedBalance = finalBalance - amount;
    dataProgram('WRITE', updatedBalance);
    return `Amount debited. New balance: ${formatCobolBalance(updatedBalance)}`;
  }

  return 'Insufficient funds for this debit.';
}

async function operations(passedOperation, rl) {
  const operationType = passedOperation;

  if (operationType === 'TOTAL ') {
    console.log(viewBalanceMessage());
    return;
  }

  if (operationType === 'CREDIT') {
    const amountInput = await rl.question('Enter credit amount: ');
    console.log(creditAccount(amountInput));
    return;
  }

  if (operationType === 'DEBIT ') {
    const amountInput = await rl.question('Enter debit amount: ');
    console.log(debitAccount(amountInput));
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });
  let continueFlag = 'YES';

  try {
    while (continueFlag !== 'NO') {
      console.log('--------------------------------');
      console.log('Account Management System');
      console.log('1. View Balance');
      console.log('2. Credit Account');
      console.log('3. Debit Account');
      console.log('4. Exit');
      console.log('--------------------------------');

      const choiceInput = await rl.question('Enter your choice (1-4): ');
      const userChoice = Number.parseInt(choiceInput, 10);

      switch (userChoice) {
        case 1:
          await operations('TOTAL ', rl);
          break;
        case 2:
          await operations('CREDIT', rl);
          break;
        case 3:
          await operations('DEBIT ', rl);
          break;
        case 4:
          continueFlag = 'NO';
          break;
        default:
          console.log('Invalid choice, please select 1-4.');
      }
    }

    console.log('Exiting the program. Goodbye!');
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Application error:', error);
    process.exitCode = 1;
  });
}

module.exports = {
  dataProgram,
  formatCobolBalance,
  viewBalanceMessage,
  creditAccount,
  debitAccount,
  resetStorageBalance,
};
