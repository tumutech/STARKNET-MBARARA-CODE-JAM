#[starknet::interface]
trait ICounter<TContractState> {
    fn get(self: @TContractState) -> u256;
    fn set(ref self: TContractState, x:u256);
    
}
#[starknet::contract]
mod Counter {
    #[storage]
    struct Storage {
        counter: u256
    }
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
    }

    #[abi(embed_v0)]
    impl ICounterImpl of super::ICounter<ContractState>{
        fn get(self: @ContractState) -> u256{
            self.counter.read()
        }
        fn set(ref self: ContractState, x:u256){
            self.counter.write(self.counter.read()+x);
        }
        
    }

}
