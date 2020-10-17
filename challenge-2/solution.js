const { Server, Keypair, TransactionBuilder, BASE_FEE, Networks, Operation, Asset } = require('stellar-sdk')
const parseError = require('@runkit/tyvdh/parse-error/2.0.0')

try {
  const server = new Server('https://horizon-testnet.stellar.org')
  const myKeypair = Keypair.fromSecret('SC44GHYUFPUSJAZSTCNRLAVXYGNCJNOWHGNQ6NGRUU5TCK4VWZIH2U53')
  const myPublicKey = myKeypair.publicKey()

  await server.loadAccount(myPublicKey)
              .then(async (account) => {
                console.log('Account exists and is ready to send a payment')

                const friendbotKeypair = Keypair.random()
                const friendbotPublicKey = friendbotKeypair.publicKey()

                await server
                  .friendbot(friendbotPublicKey)
                  .call()
                  .then(() => console.log('Random friendbot account was successfully funded'))

                const transaction = new TransactionBuilder(account, {
                  fee: BASE_FEE,
                  networkPassphrase: Networks.TESTNET
                })
                      .addOperation(Operation.payment({
                        destination: friendbotPublicKey,
                        asset: Asset.native(),
                        amount: '10'
                      }))
                      .setTimeout(0)
                      .build()

                transaction.sign(myKeypair)

                console.log('Payment transaction has been prepared and signed')
                return server.submitTransaction(transaction)
              })
              .then(() => console.log('Payment transaction was successfully submitted!'))
}

catch(err) {
  console.error(parseError(err))
};
