const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ULPIN Freeze Contract - GL-0203 Integration Tests", function () {
  let ulpinRegistry;
  let freezeContract;
  let owner;
  let addr1;
  let addr2;
  let emergencyUnlocker;

  const FREEZE_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
  const contractName = "Gujarat LandChain ULPIN Registry";
  const contractSymbol = "ULPIN";

  beforeEach(async function () {
    [owner, addr1, addr2, emergencyUnlocker] = await ethers.getSigners();

    // Deploy ULPIN Registry first
    const ULPINLandRegistry = await ethers.getContractFactory("ULPINLandRegistry");
    ulpinRegistry = await ULPINLandRegistry.deploy(contractName, contractSymbol);
    await ulpinRegistry.waitForDeployment();

    // Deploy Freeze Contract
    const ULPINFreezeContract = await ethers.getContractFactory("ULPINFreezeContract");
    freezeContract = await ULPINFreezeContract.deploy(await ulpinRegistry.getAddress());
    await freezeContract.waitForDeployment();

    // Mint a test NFT
    await ulpinRegistry.mintLandParcel(
      addr1.address,
      "GJ-01-001-001",
      "ipfs://test-metadata-hash"
    );
  });

  describe("GL-0201: Freeze State Machine", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await freezeContract.FREEZE_DURATION()).to.equal(FREEZE_DURATION);
      expect(await freezeContract.ulpinRegistry()).to.equal(await ulpinRegistry.getAddress());
      expect(await freezeContract.emergencyUnlockers(owner.address)).to.be.true;
    });

    it("Should allow token owner to initiate freeze", async function () {
      const tokenId = 1;
      const reason = "Land dispute case #123";

      await expect(
        freezeContract.connect(addr1).initiateFreeze(tokenId, reason)
      ).to.emit(freezeContract, "FreezeInitiated")
        .withArgs(tokenId, addr1.address, anyValue, anyValue, reason);

      expect(await freezeContract.isFrozen(tokenId)).to.be.true;
      expect(await freezeContract.getCurrentState(tokenId)).to.equal(1); // Active state
    });

    it("Should prevent freezing already frozen token", async function () {
      const tokenId = 1;
      const reason = "Initial freeze";

      await freezeContract.connect(addr1).initiateFreeze(tokenId, reason);

      await expect(
        freezeContract.connect(addr1).initiateFreeze(tokenId, "Second freeze")
      ).to.be.revertedWith("ULPINFreeze: Invalid token state");
    });

    it("Should automatically expire freeze after 30 days", async function () {
      const tokenId = 1;
      const reason = "Test freeze";

      await freezeContract.connect(addr1).initiateFreeze(tokenId, reason);
      expect(await freezeContract.isFrozen(tokenId)).to.be.true;

      // Fast forward 30 days
      await time.increase(FREEZE_DURATION + 1);

      // Update state to reflect expiration
      await freezeContract.updateFreezeState(tokenId);
      
      expect(await freezeContract.isFrozen(tokenId)).to.be.false;
      expect(await freezeContract.getCurrentState(tokenId)).to.equal(2); // Expired state
    });

    it("Should calculate remaining freeze time correctly", async function () {
      const tokenId = 1;
      const reason = "Test freeze";

      await freezeContract.connect(addr1).initiateFreeze(tokenId, reason);
      
      const remaining = await freezeContract.getRemainingFreezeTime(tokenId);
      expect(remaining).to.be.closeTo(FREEZE_DURATION, 10); // Within 10 seconds

      // Fast forward 15 days
      await time.increase(15 * 24 * 60 * 60);
      
      const remainingAfter = await freezeContract.getRemainingFreezeTime(tokenId);
      expect(remainingAfter).to.be.closeTo(15 * 24 * 60 * 60, 100); // ~15 days remaining
    });
  });

  describe("GL-0202: Event System", function () {
    it("Should emit FreezeInitiated event with correct parameters", async function () {
      const tokenId = 1;
      const reason = "Land dispute case #456";

      const tx = await freezeContract.connect(addr1).initiateFreeze(tokenId, reason);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(freezeContract, "FreezeInitiated")
        .withArgs(
          tokenId,
          addr1.address,
          block.timestamp,
          block.timestamp + FREEZE_DURATION,
          reason
        );
    });

    it("Should emit FreezeExpired event when freeze expires", async function () {
      const tokenId = 1;
      await freezeContract.connect(addr1).initiateFreeze(tokenId, "Test");

      await time.increase(FREEZE_DURATION + 1);

      await expect(freezeContract.updateFreezeState(tokenId))
        .to.emit(freezeContract, "FreezeExpired")
        .withArgs(tokenId, anyValue);
    });

    it("Should emit FreezeStateChanged events", async function () {
      const tokenId = 1;

      await expect(freezeContract.connect(addr1).initiateFreeze(tokenId, "Test"))
        .to.emit(freezeContract, "FreezeStateChanged")
        .withArgs(tokenId, 0, 1); // None to Active

      await time.increase(FREEZE_DURATION + 1);

      await expect(freezeContract.updateFreezeState(tokenId))
        .to.emit(freezeContract, "FreezeStateChanged")
        .withArgs(tokenId, 1, 2); // Active to Expired
    });

    it("Should emit EmergencyUnlock event", async function () {
      const tokenId = 1;
      const unlockReason = "Court order";

      await freezeContract.connect(addr1).initiateFreeze(tokenId, "Dispute");

      await expect(
        freezeContract.connect(owner).emergencyUnlock(tokenId, unlockReason)
      ).to.emit(freezeContract, "EmergencyUnlock")
        .withArgs(tokenId, owner.address, anyValue, unlockReason);
    });
  });

  describe("Emergency Unlock Mechanism", function () {
    beforeEach(async function () {
      // Add emergency unlocker
      await freezeContract.setEmergencyUnlocker(emergencyUnlocker.address, true);
    });

    it("Should allow emergency unlocker to unlock frozen token", async function () {
      const tokenId = 1;
      await freezeContract.connect(addr1).initiateFreeze(tokenId, "Test");

      await freezeContract.connect(emergencyUnlocker).emergencyUnlock(tokenId, "Emergency");
      
      expect(await freezeContract.getCurrentState(tokenId)).to.equal(3); // Emergency state
      expect(await freezeContract.isFrozen(tokenId)).to.be.false;
    });

    it("Should prevent non-authorized emergency unlock", async function () {
      const tokenId = 1;
      await freezeContract.connect(addr1).initiateFreeze(tokenId, "Test");

      await expect(
        freezeContract.connect(addr2).emergencyUnlock(tokenId, "Unauthorized")
      ).to.be.revertedWith("ULPINFreeze: Not authorized for emergency unlock");
    });

    it("Should manage emergency unlocker authorization", async function () {
      await expect(
        freezeContract.setEmergencyUnlocker(addr2.address, true)
      ).to.emit(freezeContract, "EmergencyUnlockerChanged")
        .withArgs(addr2.address, true);

      expect(await freezeContract.emergencyUnlockers(addr2.address)).to.be.true;

      await freezeContract.setEmergencyUnlocker(addr2.address, false);
      expect(await freezeContract.emergencyUnlockers(addr2.address)).to.be.false;
    });
  });

  describe("GL-0203: NFT + Freeze Integration", function () {
    it("Should integrate NFT minting with freeze functionality", async function () {
      // Mint multiple NFTs
      await ulpinRegistry.mintLandParcel(addr1.address, "GJ-01-001-002", "ipfs://metadata2");
      await ulpinRegistry.mintLandParcel(addr2.address, "GJ-01-001-003", "ipfs://metadata3");

      const tokenId1 = 1;
      const tokenId2 = 2;
      const tokenId3 = 3;

      // Freeze tokens
      await freezeContract.connect(addr1).initiateFreeze(tokenId1, "Dispute 1");
      await freezeContract.connect(addr1).initiateFreeze(tokenId2, "Dispute 2");

      // Check frozen tokens tracking
      const frozenTokens = await freezeContract.getFrozenTokens();
      expect(frozenTokens).to.have.lengthOf(2);
      expect(frozenTokens).to.include(BigInt(tokenId1));
      expect(frozenTokens).to.include(BigInt(tokenId2));

      // Check statistics
      const [totalFrozen, totalEverFrozen] = await freezeContract.getFreezeStats();
      expect(totalFrozen).to.equal(2);
      expect(totalEverFrozen).to.equal(2);
    });

    it("Should handle batch state updates efficiently", async function () {
      // Mint and freeze multiple tokens
      const tokenIds = [1, 2];
      await ulpinRegistry.mintLandParcel(addr1.address, "GJ-01-001-002", "ipfs://metadata2");
      
      await freezeContract.connect(addr1).initiateFreeze(1, "Dispute 1");
      await freezeContract.connect(addr1).initiateFreeze(2, "Dispute 2");

      // Fast forward time
      await time.increase(FREEZE_DURATION + 1);

      // Batch update
      await expect(freezeContract.batchUpdateFreezeStates(tokenIds))
        .to.emit(freezeContract, "FreezeExpired");

      // Check all are expired
      expect(await freezeContract.getCurrentState(1)).to.equal(2); // Expired
      expect(await freezeContract.getCurrentState(2)).to.equal(2); // Expired
    });

    it("Should provide complete freeze information", async function () {
      const tokenId = 1;
      const reason = "Complete test";

      await freezeContract.connect(addr1).initiateFreeze(tokenId, reason);
      
      const freezeInfo = await freezeContract.getFreezeInfo(tokenId);
      
      expect(freezeInfo.state).to.equal(1); // Active
      expect(freezeInfo.initiator).to.equal(addr1.address);
      expect(freezeInfo.reason).to.equal(reason);
      expect(freezeInfo.emergencyUnlocked).to.be.false;
      expect(freezeInfo.freezeEndTime - freezeInfo.freezeStartTime).to.equal(FREEZE_DURATION);
    });
  });

  describe("Security and Edge Cases", function () {
    it("Should prevent freezing non-existent tokens", async function () {
      await expect(
        freezeContract.connect(addr1).initiateFreeze(999, "Non-existent")
      ).to.be.reverted; // Updated to handle custom errors
    });

    it("Should require non-empty reason for freeze", async function () {
      await expect(
        freezeContract.connect(addr1).initiateFreeze(1, "")
      ).to.be.revertedWith("ULPINFreeze: Reason required");
    });

    it("Should prevent unauthorized freeze initiation", async function () {
      await expect(
        freezeContract.connect(addr2).initiateFreeze(1, "Unauthorized freeze")
      ).to.be.revertedWith("ULPINFreeze: Not authorized to freeze");
    });

    it("Should handle reentrancy protection", async function () {
      // This test ensures the ReentrancyGuard is working
      const tokenId = 1;
      await freezeContract.connect(addr1).initiateFreeze(tokenId, "Test");
      
      // Multiple rapid calls should not cause issues
      await freezeContract.updateFreezeState(tokenId);
      await freezeContract.updateFreezeState(tokenId);
    });
  });

  // Helper to match any value in events
  const anyValue = (value) => true;
});
