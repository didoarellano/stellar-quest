const { Keypair, Server, BASE_FEE, Networks, Operation, TransactionBuilder } = require('stellar-sdk');
const fetch = require('node-fetch');

const sourceAccountKeypair = Keypair.random();
const destinationPublicKey = 'GAOP5ZNGUSPKGIFHOB5PB6P7JBOBTFLUCHA24YF6VYI4BYNYAXBAN35C';

async function createSourceAccount (keys) {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(keys.publicKey())}`
  );
  return response.json();
}

(async function () {
  const server = new Server('https://horizon-testnet.stellar.org');
  await createSourceAccount(sourceAccountKeypair);
  const sourceAccount = await server.loadAccount(sourceAccountKeypair.publicKey());

  const createQuestAccount = Operation.createAccount({
    destination: destinationPublicKey,
    startingBalance: '1000',
  });

  const txn = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
        .addOperation(createQuestAccount)
        .setTimeout(0)
        .build();

  txn.sign(sourceAccountKeypair);
  server.submitTransaction(txn);
})();
