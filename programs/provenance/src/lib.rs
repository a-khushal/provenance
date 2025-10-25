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

#[account]
#[derive(InitSpace)]
pub struct PromptIndex {
    pub prompt_hash: [u8; 32],
    #[max_len(10000)]
    pub registrations: Vec<Pubkey>,
}

impl PromptIndex {
    pub const LEN: usize = 8 + 32 + (4 + 10000 * 32);
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

    #[account(
        init_if_needed,
        payer = creator,
        space = PromptIndex::LEN,
        seeds = [b"prompt_index", prompt_hash.as_ref()],
        bump
    )]
    pub prompt_index: Account<'info, PromptIndex>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(prompt_hash: [u8; 32])]
pub struct VerifyPrompt<'info> {
    #[account(
        seeds = [b"prompt_index", prompt_hash.as_ref()],
        bump
    )]
    pub prompt_index: Account<'info, PromptIndex>,
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
        let prompt_index = &mut ctx.accounts.prompt_index;
        let creator = ctx.accounts.creator.key();

        registration.prompt_hash = prompt_hash;
        registration.output_hash = output_hash;
        registration.creator = creator;
        registration.timestamp = Clock::get()?.unix_timestamp;

        if prompt_index.prompt_hash == [0u8; 32] {
            prompt_index.prompt_hash = prompt_hash;
        }

        if !prompt_index
            .registrations
            .iter()
            .any(|pk| pk == registration.to_account_info().key)
        {
            prompt_index
                .registrations
                .push(*registration.to_account_info().key);
        }

        emit!(ContentRegistered {
            prompt_hash,
            output_hash,
            creator,
            timestamp: registration.timestamp,
        });

        Ok(())
    }

    pub fn verify_prompt(ctx: Context<VerifyPrompt>, prompt_hash: [u8; 32]) -> Result<Vec<Pubkey>> {
        let prompt_index = &ctx.accounts.prompt_index;

        require!(
            prompt_index.prompt_hash == prompt_hash,
            CustomError::PromptNotFound
        );

        Ok(prompt_index.registrations.clone())
    }
}

#[error_code]
pub enum CustomError {
    #[msg("No registration found for this prompt")]
    PromptNotFound,
}
