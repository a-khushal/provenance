use anchor_lang::prelude::*;

declare_id!("A2KsJCvSpBGJjrzUoX8CHT7GrcnBV6F8p43QLopTpCtN");

#[account]
#[derive(InitSpace)]
pub struct Registration {
    pub prompt_hash: [u8; 32], // 32 bytes
    pub output_hash: [u8; 32], // 32 bytes
    pub creator: Pubkey,       // 32 bytes
    pub timestamp: i64,        // 8 bytes
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegistrationData {
    pub prompt_hash: [u8; 32],
    pub output_hash: [u8; 32],
    pub creator: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ContentRegistered {
    pub prompt_hash: [u8; 32],
    pub output_hash: [u8; 32],
    pub creator: Pubkey,
    pub timestamp: i64,
}

#[derive(Accounts)]
#[instruction(prompt_hash: [u8; 32])]
pub struct RegisterContent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Registration::INIT_SPACE,
        seeds = [b"registration", creator.key().as_ref(), prompt_hash.as_ref()],
        bump
    )]
    pub registration: Account<'info, Registration>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(prompt_hash: [u8; 32])]
pub struct VerifyPrompt<'info> {
    #[account(
        seeds = [b"registration", registration.creator.as_ref(), prompt_hash.as_ref()],
        bump
    )]
    pub registration: Account<'info, Registration>,
}

#[program]
pub mod provenance {
    use super::*;

    pub fn register_content(
        ctx: Context<RegisterContent>,
        prompt_hash: [u8; 32],
        output_hash: [u8; 32],
    ) -> Result<()> {
        let registration = &mut ctx.accounts.registration;
        registration.prompt_hash = prompt_hash;
        registration.output_hash = output_hash;
        registration.creator = ctx.accounts.creator.key();
        registration.timestamp = Clock::get()?.unix_timestamp;

        emit!(ContentRegistered {
            prompt_hash,
            output_hash,
            creator: ctx.accounts.creator.key(),
            timestamp: registration.timestamp,
        });

        Ok(())
    }

    pub fn verify_prompt(
        ctx: Context<VerifyPrompt>,
        prompt_hash: [u8; 32],
    ) -> Result<RegistrationData> {
        let registration = &ctx.accounts.registration;

        Ok(RegistrationData {
            prompt_hash: registration.prompt_hash,
            output_hash: registration.output_hash,
            creator: registration.creator,
            timestamp: registration.timestamp,
        })
    }
}
