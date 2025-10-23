import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Provenance } from "../target/types/provenance";
import { expect } from "chai";
import crypto from "crypto";
import BN from "bn.js";

describe("provenance", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.provenance as Program<Provenance>;
  const creator = anchor.web3.Keypair.generate();

  function hashString(input: string): Buffer {
    return crypto.createHash("sha256").update(input).digest();
  }

  async function airdropSol(pubkey: anchor.web3.PublicKey, amount: number) {
    const connection = program.provider.connection;
    const sig = await connection.requestAirdrop(pubkey, amount);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
  }

  it("Registers content successfully", async () => {
    const prompt = "Write a poem about cats";
    const output = "Cats are fluffy and cute...";

    const promptHash = hashString(prompt);
    const outputHash = hashString(output);

    const [registrationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("registration"),
        creator.publicKey.toBuffer(),
        promptHash,
      ],
      program.programId
    );

    await airdropSol(creator.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

    const tx = await program.methods
      .registerContent(Array.from(promptHash), Array.from(outputHash))
      .accounts({
        creator: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    console.log("Register transaction signature:", tx);

    const registrationAccount = await program.account.registration.fetch(registrationPda);
    expect(Buffer.from(registrationAccount.promptHash)).to.deep.equal(promptHash);
    expect(Buffer.from(registrationAccount.outputHash)).to.deep.equal(outputHash);
    expect(registrationAccount.creator.toString()).to.equal(creator.publicKey.toString());
    expect((registrationAccount.timestamp as BN).toNumber()).to.be.greaterThan(0);
  });

  it("Verifies prompt successfully", async () => {
    const prompt = "Generate a recipe for pizza";
    const output = "Mix flour, water, and yeast...";

    const promptHash = hashString(prompt);
    const outputHash = hashString(output);

    const [registrationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("registration"),
        creator.publicKey.toBuffer(),
        promptHash,
      ],
      program.programId
    );

    await program.methods
      .registerContent(Array.from(promptHash), Array.from(outputHash))
      .accounts({
        creator: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const registrationData = await program.methods
      .verifyPrompt()
      .accounts({
        registration: registrationPda,
      })
      .remainingAccounts([
        {
          pubkey: registrationPda,
          isWritable: false,
          isSigner: false,
        },
      ])
      .view();

    expect(Buffer.from(registrationData.promptHash)).to.deep.equal(promptHash);
    expect(Buffer.from(registrationData.outputHash)).to.deep.equal(outputHash);
    expect(registrationData.creator.toString()).to.equal(creator.publicKey.toString());
    expect(registrationData.timestamp).to.be.greaterThan(0);
  });

  it("Fails when verifying non-existent prompt", async () => {
    const nonExistentPromptHash = hashString("This prompt does not exist");

    const [registrationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("registration"),
        creator.publicKey.toBuffer(),
        nonExistentPromptHash,
      ],
      program.programId
    );

    try {
      await program.methods
        .verifyPrompt()
        .accounts({ registration: registrationPda })
        .remainingAccounts([
          {
            pubkey: registrationPda,
            isWritable: false,
            isSigner: false,
          },
        ])
        .view();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  it("Registers multiple contents from same creator", async () => {
    const prompt1 = "Write a story";
    const output1 = "Once upon a time...";

    const prompt2 = "Write a song";
    const output2 = "La la la...";

    const promptHash1 = hashString(prompt1);
    const outputHash1 = hashString(output1);
    const promptHash2 = hashString(prompt2);
    const outputHash2 = hashString(output2);

    const [registrationPda1] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("registration"),
        creator.publicKey.toBuffer(),
        promptHash1,
      ],
      program.programId
    );

    const [registrationPda2] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("registration"),
        creator.publicKey.toBuffer(),
        promptHash2,
      ],
      program.programId
    );

    await program.methods
      .registerContent(Array.from(promptHash1), Array.from(outputHash1))
      .accounts({ creator: creator.publicKey })
      .signers([creator])
      .rpc();

    await program.methods
      .registerContent(Array.from(promptHash2), Array.from(outputHash2))
      .accounts({ creator: creator.publicKey })
      .signers([creator])
      .rpc();

    const reg1 = await program.account.registration.fetch(registrationPda1);
    const reg2 = await program.account.registration.fetch(registrationPda2);

    expect(Buffer.from(reg1.promptHash)).to.deep.equal(promptHash1);
    expect(Buffer.from(reg2.promptHash)).to.deep.equal(promptHash2);
  });
});
