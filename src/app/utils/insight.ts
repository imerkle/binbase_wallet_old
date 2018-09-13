import axios from 'axios';
import { apiInsight } from 'app/constants';
//import bitcore from 'bitcore-lib';
import coininfo from 'coininfo';
import bitcoin from 'bitcoinjs-lib';

export const getUtxos = ({rel, address}) => {
	return new Promise(async (resolve, reject) => {
		try{
			const data = await axios.post(`${apiInsight[rel]}/addrs/utxo`,{
				addrs: address
			});
			console.log(data.data)
			resolve(data.data);
		}catch (e) {
			reject(e);
		};
	});
}
export const broadcastTx = ({from, rel, utxos, to, amount, wif, fee, testnet}) => {

return new Promise(async (resolve, reject) => {
	try{
			const network = coininfo(`${rel}${testnet.suffix}`).toBitcoinJS();
			var key = bitcoin.ECPair.fromWIF(wif,network);
			var tx = new bitcoin.TransactionBuilder(network);
			let total = 0;
		    for (let utx of utxos) {
		      tx.addInput(utx.txid, utx.vout)
		      total += utx.satoshis
		    }
		    tx.addOutput(to, amount)
		    const change = total - (amount + fee)
		    if (change) tx.addOutput(from, change)

		    utxos.forEach((v,i) => {
		      tx.sign(i, key)
		    })
			const rawtx = tx.build().toHex()
			console.log(rawtx);
			const data = await axios.post(`${apiInsight[rel]}/tx/send`,{
				rawtx
			});		
			resolve(data.data);
		}catch (e) {
			reject(e);
		};
	});
    /*
	const network = coininfo(`${rel}${testnet.suffix}`).toBitcore();
	const netStr = testnet ? 'testnet' : 'livenet';
	bitcore.Networks.add(network);
	bitcore.Networks.defaultNetwork = bitcore.Networks.get(netStr);

	console.log(utxos, amount, fee)
	return new Promise(async (resolve, reject) => {
		try{
			const tx = bitcore.Transaction();
			console.log(tx)
			tx.from(utxos);
			tx.to(to, amount);
			tx.change(change);
			tx.sign(wif);
			tx.fee(fee);
			tx.serialize();			
			resolve()
			return false;
			const data = await axios.post(`${apiInsight[rel]}/tx/send`,{
				rawtx: tx
			});
			resolve(data.data);
		}catch (e) {
			reject(e);
		};
	});
	*/
}

