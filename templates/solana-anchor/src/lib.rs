use switchboard_solana::prelude::*;

declare_id!("2fLRc1XeKpz8X74JLfTk6LegRdC3T6Zjt2a7WtMGxokW");

#[program]
pub mod switchboard_client {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
