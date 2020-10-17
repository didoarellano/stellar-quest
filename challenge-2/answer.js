const { Keypair, Server, BASE_FEE, Networks, Operation, Asset, TransactionBuilder } = require('stellar-sdk');
const fetch = require('node-fetch');

const { privateKey, publicKey } = require('../keys.json');
const sourceKeypair = Keypair.fromSecret(privateKey);
const destination = Keypair.random().publicKey();
const amount = '10';

async function createDestinationAccount (key) {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(key)}`
  );
  return response.json();
}

(async function () {
  const server = new Server('https://horizon-testnet.stellar.org');
  await createDestinationAccount(destination);
  const sourceAccount = await server.loadAccount(publicKey);

  const payment = Operation.payment({
    destination,
    amount,
    asset: Asset.native(),
  });

  const txn = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
        .addOperation(payment)
        .setTimeout(0)
        .build();

  txn.sign(sourceKeypair);
  server.submitTransaction(txn);
})();
