package com.hedgepie.test;

import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import java.util.ArrayList;

import org.jaxen.expr.Step;
import org.testng.annotations.Test;

import com.hedgepie.base.BaseClass;
import com.hedgepie.base.PropertiesReader;
import com.hedgepie.errorCollectors.ErrorCollector;
import com.hedgepie.pages.Dashboard;

import net.bytebuddy.asm.Advice.OnDefaultValue;

public class TestDashboard extends BaseClass{
	Dashboard lp;

	@Test 
	public void TC_8_VerifyConnectWalletPopup(){

		initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' popup");
		lp.clickOnMenu("Connect Wallet");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Metamask"),"Verified 'Metamask' is showing on landing page top bar.");
	}
	
	@Test 
	public void TC_9_VerifyUserIsAbleToNavigateToLeaderboardPage(){

	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
			
	}
	
	@Test
	public void TC_10_VerifyUserIsAbleToSeeThePerformanceOfMintedNFTs(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");
		
	}
	
	@Test
	public void TC_11_VerifyUserIsAbleToSeeDetailsOfMintedNFTs(){

	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on DETAILS button of first minted NFT.");
		lp.clickOnFirstNFTDetails();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'NFT Details' is showing.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("View Contents"),"Verified Verify 'NFT Details' is showing.");
		
	}
	
	@Test 
	public void TC_12_VerifyUserIsAbleToConnectWallet(){

	    initConfiguration();
	    initMetamask();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' popup");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
	}
	
	@Test
	public void TC_16_VerifyLeaderboardShowsTheFinishedRoundWithRespectiveProtocolSHakes(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(2000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'TVL' is showing in table.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("TVL"),"Verified 'TVL' is showing in table.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'TOTAL STAKED' is showing in table.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("TOTAL STAKED"),"Verified 'TOTAL STAKED' is showing in table.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '# OF PARTICIPANTS' is showing in table.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("# OF PARTICIPANTS"),"Verified '# OF PARTICIPANTS' is showing in table.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'DAILY Percentage' is showing in table.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("DAILY"),"Verified 'DAILY Percentage' is showing in table.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'APY' is showing in table.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("APY"),"Verified 'APY' is showing in table.");
		
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'TOTAL PROFIT' is showing in table.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("TOTAL PROFIT"),"Verified 'TOTAL PROFIT' is showing in table.");
		
	}

	
	@Test
	public void TC_18_VerifyEachMintedNFTDeatilsShowingOnViewContentsPage(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button of Minted NFT : "+names.get(0));
		lp.clickOnDetailsForNFTName(names.get(0));
		
		waitTime(2000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+names.get(0)+"' details are displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(names.get(0)),"Verified Verify '"+names.get(0)+"' details are displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'View Contents' page is displaying in NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("View Contents"),"Verified 'View Contents' page is displaying in NFT details page.");
		
	}
	
	@Test
	public void TC_19_VerifyTheStatsOnViewContentsPage(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button of Minted NFT : "+names.get(0));
		lp.clickOnDetailsForNFTName(names.get(0));
		
		waitTime(2000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+names.get(0)+"' details are displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(names.get(0)),"Verified Verify '"+names.get(0)+"' details are displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'View Contents' is displaying in NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("View Contents"),"Verified 'View Contents' is displaying in NFT details page.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Strategy Composition' is displaying in NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Strategy Composition"),"Verified 'Strategy Composition' page is displaying in NFT details page.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'TLV' page is displaying in NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("TLV"),"Verified 'TLV' page is displaying in NFT details page.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Participants' page is displaying in NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Participants"),"Verified 'Participants' page is displaying in NFT details page.");
		
	}

	@Test
	public void TC_20_VerifyThatSmartContractAddressAvailableOnDetailsPage(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button of Minted NFT : "+names.get(0));
		lp.clickOnDetailsForNFTName(names.get(0));
		
		waitTime(2000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+names.get(0)+"' details are displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(names.get(0)),"Verified Verify '"+names.get(0)+"' details are displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'View Contents' page is displaying in NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("View Contents"),"Verified 'View Contents' page is displaying in NFT details page.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Contract Address' page is displaying in NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Contract Address"),"Verified 'Contract Address' page is displaying in NFT details page.");
		
		
	}
	

	@Test
	public void TC_21_VerifyUserShouldBeAbleToNavigateToSmartContractAddress(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button of Minted NFT : "+names.get(0));
		lp.clickOnDetailsForNFTName(names.get(0));
		
		waitTime(2000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+names.get(0)+"' details are displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(names.get(0)),"Verified Verify '"+names.get(0)+"' details are displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'View Contents' page is displaying on NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("View Contents"),"Verified 'View Contents' page is displaying on NFT details page.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Contract Address' is displaying on NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Contract Address"),"Verified 'Contract Address' is displaying on NFT details page.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Smart Contract Address link.");
		lp.clickOnSmartContractAddress();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Smart Contract Address' page is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Contract Overview"),"Verified 'Smart Contract Address' page is displaying.");
		
}
	
	@Test
	public void TC_22_VerifyUserShouldBeAbleToNavigateToIPFSJsonLinkAddress(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button of Minted NFT : "+names.get(0));
		lp.clickOnDetailsForNFTName(names.get(0));
		
		waitTime(2000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+names.get(0)+"' details are displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(names.get(0)),"Verified Verify '"+names.get(0)+"' details are displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'View Contents' page is displaying on NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("View Contents"),"Verified 'View Contents' page is displaying on NFT details page.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'IPFS JSON' is displaying on NFT details page.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("IPFS JSON"),"Verified 'IPFS JSON' is displaying on NFT details page.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on IPFS JSON link.");
		lp.clickOnIPFSJsonLink();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'IPFS JSON' is displaying.");
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains(".json"),"Verified 'IPFS JSON' is displaying.");
		
}
	
	
	@Test 
	
	public void TC_23_VerifyUserShouldBeAbldeToStakeBNBByConnectingWallet(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button of Minted NFT : "+names.get(0));
		lp.clickOnDetailsForNFTName(names.get(0));
		
		waitTime(2000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+names.get(0)+"' details are displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(names.get(0)),"Verified Verify '"+names.get(0)+"' details are displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'CONNECT WALLET' button");
		lp.clickOnMenu("CONNECT WALLET");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Get current staked value.");
		String stakedValue = lp.getCurrentStakedAmount();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Stake Amount : 0.000000123");
		lp.enterAmountValue("0.000000123");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Stake button.");
		lp.clickOnStakeButton();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Open Extension Settings and click on Confirm.");
		waitTime(3000);
		lp.openExtensionSettingsAndClickOnConfirm();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Refresh the page.");
		waitTime(3000);
		driver.navigate().refresh();
		
		try {
			lp.clickOnMenu("Connect Wallet");
			ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
	
			ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
			lp.clickOnMenu("Metamask");
		}catch(Exception e) {}
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify previous staked value and current staked values are not equal.");
		ErrorCollector.verifyNotEquals(lp.getCurrentStakedAmount(), stakedValue, "Staked value does not changing.");
			
			
			
	}


	
	
	@Test 
	
	public void TC_24_VerifyUserShouldSeeValidationMessageOnEnteringValueGreaterThanAvailableBalance(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button of Minted NFT : "+names.get(0));
		lp.clickOnDetailsForNFTName(names.get(0));
		
		waitTime(2000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+names.get(0)+"' details are displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(names.get(0)),"Verified Verify '"+names.get(0)+"' details are displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'CONNECT WALLET' button");
		lp.clickOnMenu("CONNECT WALLET");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Stake Amount : 150");
		lp.enterAmountValue("150");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify error message 'Entered amount is greater than available BNB balance.' is displaying.");
		ErrorCollector.verifyTrue(isTextPresent("Entered amount is greater than available BNB balance."),"Verified error message 'Entered amount is greater than available BNB balance.' is displaying.");
		
	}
	
	@Test 
	
	public void TC_25_VerifyUserShouldSeeValidationMessageOnEnteringEmptyAmountField(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button of Minted NFT : "+names.get(0));
		lp.clickOnDetailsForNFTName(names.get(0));
		
		waitTime(2000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+names.get(0)+"' details are displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(names.get(0)),"Verified Verify '"+names.get(0)+"' details are displaying.");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'CONNECT WALLET' button");
		lp.clickOnMenu("CONNECT WALLET");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Stake Amount : 0");
		lp.enterAmountValue("0");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Stake button.");
		lp.clickOnStakeButton();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify error message 'Please input a Non-Zero value to Stake' is displaying.");
		ErrorCollector.verifyTrue(isTextPresent("Please input a Non-Zero value to Stake"),"Verified error message 'Please input a Non-Zero value to Stake' is displaying.");
			
	}


	
	@Test 
	
	public void TC_30_VerifyUserShouldBeAbleToNavigateToMintPage(){

	    initConfiguration();
		lp = new Dashboard();
		//lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
			
	}
	
	//@Test 
	
	public void TC_31_VerifyUserShouldBeAbleToMintNFT(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount.");
		lp.enterInitialStakeForMint("0.00000125");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Select Protocol : ApeSwap");
		lp.selectProtocol("ApeSwap");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Select Pool : BUSD-WBNB Farm");
		lp.selectPool("BUSD-WBNB Farm");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter percentage : 100");
		lp.enterMintPercentage("100");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button");
		lp.clickOnTextContains("Next Step");
			
	}

	@Test
	public void TC_17_VerifyLeaderBoardRangesFromFilterDropdownCapabilityToSeeDetailsOfEachMintedNFT(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Performance of multiple NFT's' is displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'Performance of multiple NFT's' is displaying.");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Getting Names of all Minted NFT's.");
		ArrayList<String> names = lp.getAllNFTNames();
		
		for(String name:names) {
			ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Details button Minted NFT : "+name);
			lp.clickOnDetailsForNFTName(name);
			
			waitTime(2000);
			ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify '"+name+"' details are displaying.");
			ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard(name),"Verified Verify '"+name+"' details are displaying.");
			
			driver.navigate().back();
			ErrorCollector.extentLogInfo("Step "+(++step)+" : Wait for NFT's to load.");
			lp.waitForNFTsToLoad();
		}
	}
	
	@Test 
	public void TC_13_VerifyUserIsAbleToConnectNetwork(){

	    initConfiguration();
	    initMetamask();
		lp = new Dashboard();
		int step=0;	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' popup");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Go to Metamask page.");
		lp.goToMetaMaskPage();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Network menu.");
		lp.clickOnNetworkMenu();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Add Network.");
		lp.clickOnTextContains("Add network");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Network Name: Binance Smart Chain");
		lp.enterNetworkName("Binance Smart Chain");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Network New RPC URL: https://bsc-dataseed.binance.org/");
		lp.enterNetworkRPC("https://bsc-dataseed.binance.org/");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Network Chain ID: 56");
		lp.enterNetworkChainID("56");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Network Currency Symbol: BNB");
		lp.enterNetworkCurrencySymbol("BNB");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Save Button");
		lp.clickOnTextContains("Save");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Got It Button");
		lp.clickOnTextContains("Got it");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Network Successfully Added' message is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("“Binance Smart Chain” was successfully added!"),"Verified 'Network Successfully Added' message is displaying.");
			
	}

	
	@Test 
	
	public void TC_14_VerifyWalletIsAutomaticallySwitched(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamask();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' popup");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Go to Metamask page.");
		lp.goToMetaMaskPage();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Network menu.");
		lp.clickOnNetworkMenu();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Add Network.");
		lp.clickOnTextContains("Add network");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Network Name: Binance Smart Chain");
		lp.enterNetworkName("Mumbai TestNet");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Network New RPC URL: https://bsc-dataseed.binance.org/");
		lp.enterNetworkRPC("https://rpc-mumbai.maticvigil.com/");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Network Chain ID: 56");
		lp.enterNetworkChainID("80001");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter Network Currency Symbol: BNB");
		lp.enterNetworkCurrencySymbol("MATIC");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Save Button");
		lp.clickOnTextContains("Save");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Got It Button");
		lp.clickOnTextContains("Got it");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Network Successfully Added' message is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("“Mumbai TestNet” was successfully added!"),"Verified 'Network Successfully Added' message is displaying.");
		
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Go to app home page.");
		openURL("AppURL");
		
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' popup");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Go to Extension Settings and click on Cancel.");
		lp.openExtensionSettingAndClickOnCancel();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Switch Back and verify 'Trying to connect to a network other than BNB Testnet or BNB Mainnet' message is displaying.");
		ErrorCollector.verifyTrue(isTextPresent("Trying to connect to a network other than BNB Testnet or BNB Mainnet"),"Verified 'Trying to connect to a network other than BNB Testnet or BNB Mainnet' message is displaying.");
		
			
	}
	

	@Test 
	public void TC_32_VerifyUserShouldBeAbleToEnterBNBAmountWhileMintingNFT(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify entered amount is correct.");
		ErrorCollector.verifyEquals(lp.getStakeAmountFieldText(), amount,"Amounts are not matching");
			
			
	}

	
	
	@Test 
	public void TC_33_VerifyUserShouldBeAbleToClickOnNextAfterEnteringStakeAmountWhileMintingNFT(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify entered amount is correct.");
		ErrorCollector.verifyEquals(lp.getStakeAmountFieldText(), amount,"Amounts are not matching");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Next Step' button is clickable");
		ErrorCollector.verifyTrue(lp.verifyButtonContainsTextClickable("Next Step"),"Verified 'Next Step' button is clickable.");
	}
	

	@Test 
	public void TC_35_VerifyUserShouldNotAbleToEnterStakeAmountWithoutConnectingWallet(){

	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Please connect your wallet, before entering the initial stake' message is displaying.");
		ErrorCollector.verifyTrue(isTextPresent("Please connect your wallet, before entering the initial stake"),"Verified 'Please connect your wallet, before entering the initial stake' message is displaying.");
	}

	
	@Test 
	public void TC_36_VerifyUserShouldNotAbleToEnterStakeAmountGreaterThanAvailableBalance(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		String balance = lp.connectWalletAndGetBalance();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		double currBalance = Double.parseDouble(balance);
		++currBalance;
		String amount = ""+currBalance;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Entered amount is greater than available BNB balance.' message is displaying.");
		ErrorCollector.verifyTrue(isTextPresent("Entered amount is greater than available BNB balance."),"Verified 'Entered amount is greater than available BNB balance.' message is displaying.");
	}

	@Test 
	public void TC_37_VerifyUserShouldSeeValidationMessageOnEnteringStakeAmountGreaterThanAvailableBalance(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		String balance = lp.connectWalletAndGetBalance();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		double currBalance = Double.parseDouble(balance);
		++currBalance;
		String amount = ""+currBalance;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Entered amount is greater than available BNB balance.' message is displaying.");
		ErrorCollector.verifyTrue(isTextPresent("Entered amount is greater than available BNB balance."),"Verified 'Entered amount is greater than available BNB balance.' message is displaying.");
	}


	@Test 
	public void TC_38_VerifyUserShouldBeAbleToEnterMintDescriptionWhileMintingNFT(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify mint description field is enabled.");
		ErrorCollector.verifyTrue(lp.isMintDescriptionFieldEnabled(),"Verified mint description field is enabled.");
		
		String desc = "Test Description";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter description : "+desc);
		lp.enterMintDescription(desc);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify entered descripton is correct.");
		ErrorCollector.verifyEquals(lp.getMintDescriptionFieldText(), desc,"Descriptions are not matching");
			
			
	}

	
	@Test 
	public void TC_40_VerifyUserShouldBeAbleToSelectProtocolWhileMintingNFT(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button.");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify protocol dropdown is enabled.");
		ErrorCollector.verifyTrue(lp.verifyProtocolDropdownIsEnabled(),"Verified protocol dropdown is enabled.");
		
		String protocol = "ApeSwap";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Select Protocol : ApeSwap");
		lp.selectProtocol("ApeSwap");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify selected protocol is correct.");
		ErrorCollector.verifyEquals(lp.getSelectedProtocolValue(), protocol);
			
			
	}
	

	
	@Test 
	public void TC_41_VerifyUserShouldBeAbleToSelectPoollWhileMintingNFT(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button.");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Select Protocol : ApeSwap");
		lp.selectProtocol("ApeSwap");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify pool dropdown is enabled.");
		ErrorCollector.verifyTrue(lp.verifyPoolDropdownIsEnabled(),"Verified pool dropdown is enabled.");
		
		String  pool= "BUSD-WBNB Farm";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Select Pool : "+pool);
		lp.selectPool(pool);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify selected pool is correct.");
		ErrorCollector.verifyEquals(lp.getSelectedProolValue(), pool);
			
			
	}
	

	
	@Test 
	public void TC_42_VerifyUserShouldBeAbleToSetAllocationPercentageWhileMintingNFT(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button.");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Select Protocol : ApeSwap");
		lp.selectProtocol("ApeSwap");
	
		
		String  pool= "BUSD-WBNB Farm";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Select Pool : "+pool);
		lp.selectPool(pool);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify percentage input is enabled.");
		ErrorCollector.verifyTrue(lp.verifyCompositionWeightInputIsEnabled(),"Verified percentage input is enabled..");
		
		String percentage = "10";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter composition percentage value: "+percentage);
		lp.enterCompositionWeight(percentage);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify composition value is correct.");
		ErrorCollector.verifyEquals(lp.getCompositionWeightValue(), percentage,"Composition values are not equal.");
			
			
	}
	
	@Test 
	public void TC_43_VerifyUserisAbleToAddMultipleStakePositions(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button.");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Get current Stake Positions Size.");
		int currentSize = lp.getCurrentStakePositionsSize();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Add Position' button.");
		lp.clickOnTextContains("Add position");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify stake positions are increased.");
		waitTime(1000);
		ErrorCollector.verifyNotEquals(lp.getCurrentStakePositionsSize(), currentSize, amount);
	}
	

	
	//@Test  BUG
	public void TC_44_VerifyUserisAbleToStakePercentageAssignToMiltiplePositionsAreCorrectlyDivided(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button.");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Add Position' button.");
		lp.clickOnTextContains("Add position");
		
//			ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify stake positions percentage divided correctly.");
//			waitTime(1000);
//			ErrorCollector.verifyNotEquals(lp.getCurrentStakePositionsSize(), 12, amount);
	}
	

	
	@Test 
	public void TC_45_VerifyUserisAbleToDeleteStakePosition(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button.");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Add Position' button.");
		lp.clickOnTextContains("Add position");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Get current Stake Positions Size.");
		int currentSize = lp.getCurrentStakePositionsSize();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on Delete button for last stake position.");
		lp.clickOnDeletePositionButton();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify stake positions are decreased.");
		waitTime(1000);
		ErrorCollector.verifyNotEquals(lp.getCurrentStakePositionsSize(), currentSize, amount);
	}
	
	@Test 
	public void TC_46_VerifyUserisAbleToLockAllocationPosition(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button.");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter composition weigt: 50");
		lp.enterCompositionWeight("50");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Lock' button.");
		lp.clickOnAllocationLockButton();
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify allocation position is locked.");
		ErrorCollector.verifyFalse(lp.verifyAllocationPercentageInputIsDisplaying(),"Verified allocation position is locked.");
	}
	

	@Test 
	public void TC_47_VerifyUserisAbleToMaxTheAllocationPercentage(){

	    initConfiguration();
		lp = new Dashboard();
		lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Connect Wallet' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Connect Wallet"),"Verified 'Connect Wallet' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Connect Wallet' menu");
		lp.clickOnMenu("Connect Wallet");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Metamask' in popup");
		lp.clickOnMenu("Metamask");
		waitTime(3000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Proceed Metamask login.");
		lp.connectWallet();
		
		waitTime(1000);
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Wallet address' is displaying.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("0x"),"Verified 'Wallet address' is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Mint' menu");
		lp.clickOnMenu("Mint");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Mint' page is displaying.");
		waitTime(3000);
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("mint"),"Verified 'Mint' page is displaying.");
	
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify initial stake amount is enabled.");
		ErrorCollector.verifyTrue(lp.isStakeAmountFieldEnabled(),"Verified  initial stake amount is enabled.");
		
		String amount = "0.00000125";
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Enter initial Stake amount : "+amount);
		lp.enterInitialStakeForMint(amount);
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Next Step' button.");
		lp.clickOnTextContains("Next Step");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Max' button.");
		lp.clickOnTextContains("MAX");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify allocation percentage is max.");
		waitTime(1000);
		ErrorCollector.verifyEquals(lp.getCompositionWeightValue(),"100","Verified allocation percentage is max.");
	}
	

	

	@Test
	public void TC_59_VerifyUserIsAbleToSeeMintedNFTs(){
	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit App url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("Leaderboard"),"Verified 'Leaderboard' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'Leaderboard' menu");
		lp.clickOnMenu("Leaderboard");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Leaderboard' page is displaying.");
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("leaderboard"),"Verified 'Leaderboard' page is displaying.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'minted NFT's' are displaying.");
		ErrorCollector.verifyTrue(lp.getMintedNFTs().size()>0,"Verified 'minted NFT's' are displaying.");
		//driver.close();
}
	
	
	@Test 
	
	public void TC_60_VerifyThatUserShouldBeAbleToClickOnWhitepaperMenu(){

	    initConfiguration();
		lp = new Dashboard();
		//lp.initMetamaskWithNetwork();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'White Paper' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("White Paper"),"Verified 'White Paper' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'White Paper' menu is clickable");
		ErrorCollector.verifyTrue(lp.verifyButtonContainsTextClickable("White Paper"),"Verified 'Whitepaper' is clickable.");
			
	}

	
	@Test 
	
	public void TC_61_VerifyThatWhitePaperIsAttached(){

	    initConfiguration();
		lp = new Dashboard();
		int step=0;
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Visit web url");
		openURL("AppURL");
		waitTime(3000);
					
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'White Paper' button is showing on landing page top bar.");
		ErrorCollector.verifyTrue(lp.isDisplayingOnUserDashboard("White Paper"),"Verified 'White Paper' is showing on landing page top bar.");
		
		ErrorCollector.extentLogInfo("Step "+(++step)+" : Click on 'White Paper' menu");
		lp.clickOnMenu("White Paper");

		ErrorCollector.extentLogInfo("Step "+(++step)+" : Verify 'Whitepaper' is displaying.");
		waitTime(3000);
		ArrayList<String> tabs = new ArrayList<String> (driver.getWindowHandles());
		driver.switchTo().window(tabs.get(tabs.size()-1));
		ErrorCollector.verifyTrue(driver.getCurrentUrl().contains("Whitepaper"),"Verified 'Whitepaper' is displaying.");
			
	}

}
