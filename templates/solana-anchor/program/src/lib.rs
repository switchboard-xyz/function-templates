use anchor_lang::prelude::*;

declare_id!("BrHEnBouwW1WggMnVZEbT2iGsNQMWk9u6ZVRcUyiXPXu");

#[program]
pub mod switchboard_client {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
