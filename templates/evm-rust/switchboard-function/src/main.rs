use ethers::{
    prelude::{abigen, ContractCall, EthAbiCodec, EthAbiType, SignerMiddleware},
    providers::{Http, Provider},
    types::{Address, U256},
};
use rand;
use std::env;
use std::sync::Arc;
use std::time::{Duration, SystemTime};
use switchboard_evm::sdk::{EVMFunctionRunner, EVMMiddleware};

#[tokio::main(worker_threads = 12)]
async fn main() {
    // define the abi for the functions in the contract you'll be calling
    // -- here it's just a function named "callback", expecting a random u256
    abigen!(
        Receiver,
        r#"[
            function fillOrder(uint256,uint256)
        ]"#,
    );

    // Define the type we're getting from the function call
    #[derive(Debug, Clone, EthAbiType, EthAbiCodec)]
    struct OrderParams {
        order_id: U256,
        sender: Address,
    }

    // Generates a new enclave wallet, pulls in relevant environment variables
    let function_runner = EVMFunctionRunner::new().unwrap();

    // set the gas limit and expiration date
    let gas_limit = 1_000_000;
    let expiration_time_seconds = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or(Duration::ZERO)
        .as_secs()
        + 64;

    // create a client, wallet and middleware. This is just so we can create the contract instance and sign the txn.
    // @TODO: update the provider to whichever network you're using
    let provider = Provider::<Http>::try_from("https://rpc.test.btcs.network").unwrap();
    let client = Arc::new(
        SignerMiddleware::new_with_provider_chain(
            provider.clone(),
            function_runner.enclave_wallet.clone(),
        )
        .await
        .unwrap(),
    );

    // get contract address from docker env
    let contract_address = env!("SWITCHBOARD_RECEIVER_ADDRESS")
        .parse::<ethers::types::Address>()
        .unwrap();

    let receiver_contract = Receiver::new(contract_address, client);

    // Get individual call parameters and their corresponding call ids
    let params = function_runner.params::<OrderParams>();

    // No calls from these addresses will be processed
    // It'll be cheaper to check off-chain in a function runner than on-chain in a contract,
    // especially if there are many
    let blocked_senders = vec!["0x0000000000000000000000000000000000000000"];

    // Handle each function call that has happened since the last run
    let calls: Vec<ContractCall<EVMMiddleware<_>, _>> = params
        .iter()
        .filter(|param| {
            // params in format (Result<OrderParams, Err>, call_id Address)[], one per call since last fn run
            // here we filter out params that failed to parse & blocked params.sender addresses
            !param.0.is_err()
                && !blocked_senders.contains(&param.0.as_ref().unwrap().sender.to_string().as_str())
        })
        .map(|param| {
            // Handle each param, call_id pair
            let (param_result, _call_id) = param;
            let param = param_result.as_ref().unwrap();
            let order_id = param.order_id;

            // generate a random number U256
            let random: [u64; 4] = rand::random();
            let random = U256(random);

            // Create a contract call for each param
            let contract_fn_call: ContractCall<EVMMiddleware<_>, _> =
                receiver_contract.fill_order(order_id, random);

            // return the contract call
            contract_fn_call
        })
        .collect::<Vec<_>>();

    // Emit the result
    // @NOTE function_runner.emit will mark all call_ids as resolved
    function_runner
        .emit(
            contract_address,
            expiration_time_seconds.try_into().unwrap(),
            gas_limit.into(),
            calls,
        )
        .unwrap();

    // Alternatively if you wanted to only handle a subsset of calls in each run, you can call emit_resolve
    // which only marks the passed-in call_ids as completed - leaving the rest for subsequent runs to handle.
    //
    // function_runner.emit_resolve(
    //     contract_address,
    //     expiration_time_seconds.try_into().unwrap(),
    //     gas_limit.into(),
    //     calls,
    //     call_ids, // Vec<Address> of call_ids to resolve <--- this is the only difference
    // ).unwrap();
}
