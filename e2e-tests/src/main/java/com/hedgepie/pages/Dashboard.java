package com.hedgepie.pages;

import java.nio.channels.NetworkChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import com.hedgepie.base.BaseClass;
import com.hedgepie.base.PropertiesReader;import com.hedgepie.errorCollectors.ErrorCollector;

public class Dashboard extends BaseClass {

	@FindBy(xpath = ("(//*[contains(text(),'Login')])[last()]"))
	WebElement btnLogin;

	@FindBy(xpath = ("//*[contains(text(),'Dashboard')]"))
	WebElement userDashboard;
	
	@FindBy(xpath = ("//input[@name='email']"))
	WebElement inputName;
	
	@FindBy(xpath = ("//input[@name='password']"))
	WebElement inputPass;

	@FindBy(xpath="(//button[contains(text(),'DETAILS')])[1]")
	private WebElement firstNFTDetails;

	@FindBy(xpath="//tbody/tr/td[2]/div")
	private List<WebElement> nftNames;

	@FindBy(xpath="//div[contains(@class,'network-display')]")
	private WebElement networkMenu;

	@FindBy(xpath="(//input[contains(@class,'form-field__input')])[1]")
	private WebElement networkName;
	
	@FindBy(xpath="(//input[contains(@class,'form-field__input')])[2]")
	private WebElement networkRPCUrl;
	
	@FindBy(xpath="(//input[contains(@class,'form-field__input')])[3]")
	private WebElement networkChainID;
	
	@FindBy(xpath="(//input[contains(@class,'form-field__input')])[4]")
	private WebElement networkCurrencySymbol;

	@FindBy(xpath="//span[contains(text(),'Contract Address')]/following-sibling::span/a")
	private WebElement smartContractAddress;

	@FindBy(xpath="//span[contains(text(),'IPFS JSON')]/following-sibling::span/a")
	private WebElement IPFSJsonLink;

	@FindBy(xpath = "//input[@id='amount-input']")
	private WebElement amountField;

	@FindBy(xpath="//span[text()='STAKED']/following-sibling::span")
	private WebElement stakedAmount;

	@FindBy(xpath="//button[text()='STAKE']")
	private WebElement stakeButton;

	@FindBy(xpath="//input")
	private WebElement inputInitialStake;
	
	@FindBy(xpath="//*[contains(@class,'summary-allocated-title')]")
	private WebElement stakeAllocatedGraph;

	@FindBy(xpath="(//div[contains(@class,'select__control')])[1]")
	private WebElement protocolSelector;

	@FindBy(xpath="(//div[contains(@class,'select__control')])[2]")
	private WebElement poolSelector;

	@FindBy(xpath = "//*[contains(@class,'currency-display-component__text')]")
	private WebElement availableBNBBalance;
	
	@FindBy(xpath = "//textArea")
	WebElement stakeAmountDescription;

	@FindBy(xpath = "(//*[contains(@class,'css-1k96gca')])[1]")
	private WebElement selectedProtocolValue;

	@FindBy(xpath = "(//*[contains(@class,'css-1k96gca')])[2]")
	private WebElement selectedPoolValue;

	@FindBy(xpath = "(//input[contains(@class,'weight-input')])[1]")
	private WebElement compositionWeightInput;

	@FindBy(xpath = "//input[contains(@class,'weight-input')]")
	List<WebElement> stakePositionsList;

	@FindBy(xpath = "(//button[contains(@class,'position-delete')])[last()]")
	private WebElement btnDeleteStakePosition;

	@FindBy(xpath = "(//button[contains(@class,'position-lock')])[1]")
	private WebElement allocationLockButton;
	
	public Dashboard() {
		PageFactory.initElements(driver, this);
	}
	
	public void clickOnLoginButton() {
		click(btnLogin);
	}
	
	public void enterEmail(String email) {
		type(inputName, email);
	}
	
	public void enterPassword(String pass) {
		type(inputPass, pass);
	}
	
	public boolean isUserDashboardDisplaying() {
		return isElementDisplayed(userDashboard);
	}
	
	public void clickOnMenu(String value) {
		try {
			click(driver.findElement(By.xpath("//*[contains(text(),'"+value+"')]")));
		}catch (Exception e) {
		}
	}
	
	public boolean isDisplayingOnUserDashboard(String value) {
		return isElementDisplayed(driver.findElement(By.xpath("(//*[contains(text(),'"+value+"')])[last()]")));
	}

	public boolean isInvalidCredentialsErrorMessageDisplaying() {
		return isElementDisplayed(driver.findElement(By.xpath("//*[contains(text(),'Unable to log in with provided credentials.')]")));
	}

	public void connectWallet() {
		driver.get(extensionHomePage);
	    waitTime(1000);
	    clickOnTextContains("Next");
		clickOnTextContains("Connect");
		openURL("AppURL");
		waitTime(3000);
		clickOnMenu("Connect Wallet");
		clickOnMenu("Metamask");
	}
	
	public String connectWalletAndGetBalance() {
		driver.get(extensionHomePage);
	    waitTime(1000);
	    clickOnTextContains("Next");
		clickOnTextContains("Connect");
		waitTime(2000);
		String balance = getElementText(availableBNBBalance);
		openURL("AppURL");
		waitTime(3000);
		clickOnMenu("Connect Wallet");
		clickOnMenu("Metamask");
		return balance;
	}
	
	public void goToMetaMaskPage() {
		driver.get(extensionHomePage);
	}
	
	public List<WebElement> getMintedNFTs(){
		try {
			waitForElementVisibility(driver.findElement(By.xpath("(//tbody/tr)[1]")), "90");
		}catch(Exception e) {
		}
		List<WebElement> list = driver.findElements(By.xpath("//tbody/tr"));
		printString("NFT's found: "+list.size());
		return list;
	}

	public void clickOnFirstNFTDetails() {
		click(firstNFTDetails);
	}

	public ArrayList<String> getAllNFTNames() {
		 ArrayList<String>  names = new ArrayList<>();
		 for(WebElement name:nftNames) {
			 names.add(getElementText(name));
		 }
		return names;
	}

	public void clickOnDetailsForNFTName(String name) {
		WebElement ele = (driver.findElement(By.xpath("//*[contains(text(),'"+name+"')]/../..//td/button")));
		scrollIntoViewSmoothly(ele);
		waitTime(1000);
		click(ele);
	}

	public void waitForNFTsToLoad() {
		try {
			waitForElementVisibility(driver.findElement(By.xpath("(//tbody/tr)[1]")), "80");
			waitTime(1000);
		}catch(Exception e) {}
	}

	public void clickOnNetworkMenu() {
		click(networkMenu);
	}

	public void enterNetworkName(String string) {
		type(networkName,string);
	}
	
	public void enterNetworkRPC(String string) {
		type(networkRPCUrl,string);
	}
	
	public void enterNetworkChainID(String string) {
		type(networkChainID,string);
	}
	
	public void enterNetworkCurrencySymbol(String string) {
		type(networkCurrencySymbol,string);
	}
	
	public void initMetamaskWithNetwork() {
		driver.get(extensionHomePage+"#initialize/welcome");
		waitTime(1000);
	    clickOnTextContains("Get started");
	    clickOnTextContains("I agree");
	    clickOnTextContains("Import wallet");
	    String key = PropertiesReader.getPropertyValue(env+"_key");
	    String[] keys = key.split(" ");
	    for(int i=0;i<keys.length;i++) {
		    type(driver.findElement(By.xpath("//input[@id='import-srp__srp-word-"+i+"']")), keys[i]);
	    }	    
 	    type(driver.findElement(By.xpath("//input[@id='password']")), PropertiesReader.getPropertyValue(env+"_Password"));
	    type(driver.findElement(By.xpath("//input[@id='confirm-password']")), PropertiesReader.getPropertyValue(env+"_Password"));
	    click(driver.findElement(By.xpath("//input[@id='create-new-vault__terms-checkbox']")));
	    waitTime(1000);
	    clickOnTextContains("Import");
	    waitForTextContains("All done",90);
	    clickOnTextContains("All done");
	    waitTime(2000);
	    clickOnNetworkMenu();
	    clickOnTextContains("Add network");
	    enterNetworkName("Binance Smart Chain");
	    enterNetworkRPC("https://bsc-dataseed.binance.org/");
	    enterNetworkChainID("56");
	    enterNetworkCurrencySymbol("BNB");
	    clickOnTextContains("Save");
	    try {
	    	clickOnTextContains("Got it");
		} catch (Exception e) {
		}
	}

	public void openExtensionSettingAndClickOnCancel() {
		ArrayList<String> tabs = new ArrayList<String> (driver.getWindowHandles());
		openNewTab();
		ArrayList<String> tabs2 = new ArrayList<String> (driver.getWindowHandles());
		driver.switchTo().window(tabs2.get(tabs2.size()-1));
		driver.get(extensionHomePage);
		clickOnTextContains("Cancel");
		waitTime(1000);
		driver.close();
		driver.switchTo().window(tabs.get(tabs.size()-1));
	}
	
	public void openExtensionSettingsAndClickOnConfirm() {
		ArrayList<String> tabs = new ArrayList<String> (driver.getWindowHandles());
		openNewTab();
		ArrayList<String> tabs2 = new ArrayList<String> (driver.getWindowHandles());
		driver.switchTo().window(tabs2.get(tabs2.size()-1));
		driver.get(extensionHomePage);
		clickOnTextContains("Confirm");
		waitTime(1000);
		driver.close();
		driver.switchTo().window(tabs.get(tabs.size()-1));
	}

	public void clickOnSmartContractAddress() {
		click(smartContractAddress);
		ArrayList<String> tabs2 = new ArrayList<String> (driver.getWindowHandles());
		driver.switchTo().window(tabs2.get(tabs2.size()-1));
	}

	public void clickOnIPFSJsonLink() {
		click(IPFSJsonLink);
		ArrayList<String> tabs2 = new ArrayList<String> (driver.getWindowHandles());
		driver.switchTo().window(tabs2.get(tabs2.size()-1));
	}

	public void enterAmountValue(String string) {
		type(amountField,string);
	}

	public String getCurrentStakedAmount() {
		return getElementText(stakedAmount);
	}

	public void clickOnStakeButton() {
		click(stakeButton);
	}

	public void enterInitialStakeForMint(String value) {
		type(inputInitialStake,value);
	}

	public void selectProtocol(String string) {
		click(protocolSelector);
		waitTime(1000);
		clickOnTextContains(string);
	}

	public void selectPool(String string) {
		click(poolSelector);
		waitTime(1000);
		clickOnTextContains(string);
	}

	public void enterMintPercentage(String string) {
		type(amountField, string);
	}

	public boolean verifyButtonContainsTextClickable(String text) {
		return isElementEnabled(driver.findElement(By.xpath("//*[contains(text(),'"+text+"')]")));
	}

	public boolean isStakeAmountFieldEnabled() {
		return isElementEnabled(inputInitialStake);
	}
	
	public String getStakeAmountFieldText() {
		return getElementAttributeValue(inputInitialStake,"value");
	}
	
	public void enterMintDescription(String string) {
		type(stakeAmountDescription, string);
	}

	public boolean isMintDescriptionFieldEnabled() {
		return isElementEnabled(stakeAmountDescription);
	}
	
	public String getMintDescriptionFieldText() {
		return getElementAttributeValue(stakeAmountDescription,"value");
	}

	public boolean verifyProtocolDropdownIsEnabled() {
		return isElementEnabled(protocolSelector);
	}
	
	public boolean verifyPoolDropdownIsEnabled() {
		return isElementEnabled(poolSelector);
	}

	public String getSelectedProtocolValue() {
		return getElementText(selectedProtocolValue);
	}

	public String getSelectedProolValue() {
		return getElementText(selectedPoolValue);
	}

	public boolean verifyCompositionWeightInputIsEnabled() {
		return isElementDisplayed(compositionWeightInput);
	}
	
	public void enterCompositionWeight(String weight) {
		type(compositionWeightInput,weight);
	}
	
	public String getCompositionWeightValue() {
		return getElementAttributeValue(compositionWeightInput, "value");
	}

	public int getCurrentStakePositionsSize() {
		return stakePositionsList.size();
	}

	public void clickOnDeletePositionButton() {
		click(btnDeleteStakePosition);
	}

	public void clickOnAllocationLockButton() {
		click(allocationLockButton);
	}
	
	public boolean verifyAllocationPercentageInputIsDisplaying() {
		return isElementDisplayed(compositionWeightInput);
	}

}
