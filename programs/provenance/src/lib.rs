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
    #[max_len(100)]
    pub registrations: Vec<Pubkey>,
}

impl PromptIndex {
    pub const LEN: usize = 8 + 32 + (4 + 100 * 32);
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
        init_if_needed,
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

#[derive(Accounts)]
#[instruction(registration_data: Vec<RegistrationData>)]
pub struct BatchRegisterContent<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(prompt_hash: [u8; 32], output_hash: [u8; 32])]
pub struct BatchRegisterItem<'info> {
    #[account(
        init_if_needed,
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
        let current_time = Clock::get()?.unix_timestamp;
        let registration_key = registration.key();

        if registration.creator == Pubkey::default() {
            registration.prompt_hash = prompt_hash;
            registration.output_hash = output_hash;
            registration.creator = creator;
            registration.timestamp = current_time;

            if prompt_index.registrations.is_empty() {
                prompt_index.prompt_hash = prompt_hash;
            }

            if !prompt_index.registrations.contains(&registration_key) {
                prompt_index.registrations.push(registration_key);
            }
        } else {
            require_keys_eq!(registration.creator, creator, CustomError::Unauthorized);
            registration.output_hash = output_hash;
            registration.timestamp = current_time;
        }

        emit!(ContentRegistered {
            prompt_hash,
            output_hash,
            creator,
            timestamp: current_time,
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

    pub fn batch_register_content(
        ctx: Context<BatchRegisterContent>,
        registration_data: Vec<RegistrationData>,
    ) -> Result<()> {
        let creator = ctx.accounts.creator.key();
        let current_time = Clock::get()?.unix_timestamp;

        require!(!registration_data.is_empty(), CustomError::EmptyBatch);

        require!(
            registration_data.len() <= 10, // Limit batch size to prevent transaction size issues
            CustomError::BatchTooLarge
        );

        for data in registration_data {
            emit!(ContentRegistered {
                prompt_hash: data.prompt_hash,
                output_hash: data.output_hash,
                creator,
                timestamp: current_time,
            });
        }

        Ok(())
    }

    pub fn batch_register_item(
        ctx: Context<BatchRegisterItem>,
        prompt_hash: [u8; 32],
        output_hash: [u8; 32],
    ) -> Result<()> {
        let registration = &mut ctx.accounts.registration;
        let prompt_index = &mut ctx.accounts.prompt_index;
        let creator = ctx.accounts.creator.key();
        let current_time = Clock::get()?.unix_timestamp;
        let registration_key = registration.key();

        if registration.creator == Pubkey::default() {
            registration.prompt_hash = prompt_hash;
            registration.output_hash = output_hash;
            registration.creator = creator;
            registration.timestamp = current_time;

            if prompt_index.registrations.is_empty() {
                prompt_index.prompt_hash = prompt_hash;
            }

            if !prompt_index.registrations.contains(&registration_key) {
                prompt_index.registrations.push(registration_key);
            }
        } else {
            require_keys_eq!(registration.creator, creator, CustomError::Unauthorized);
            registration.output_hash = output_hash;
            registration.timestamp = current_time;
        }

        emit!(ContentRegistered {
            prompt_hash,
            output_hash,
            creator,
            timestamp: current_time,
        });

        Ok(())
    }
}

#[error_code]
pub enum CustomError {
    #[msg("No registration found for this prompt")]
    PromptNotFound,

    #[msg("You are not authorized to perform this action")]
    Unauthorized,

    #[msg("Batch registration cannot be empty")]
    EmptyBatch,

    #[msg("Batch size too large (max 10 items)")]
    BatchTooLarge,
}
