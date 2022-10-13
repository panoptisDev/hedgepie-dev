package com.hedgepie.base;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.KeyEvent;
import java.io.File;
import java.io.FileInputStream;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterTest;
import org.testng.asserts.SoftAssert;

import com.aventstack.extentreports.ExtentTest;
import com.hedgepie.errorCollectors.ErrorCollector;
import com.hedgepie.listeners.ExtentListeners;
import com.hedgepie.utilities.ExcelReader;

import freemarker.template.SimpleDate;
import io.github.bonigarcia.wdm.WebDriverManager;

public class BaseClass {
	/*
	 * WebDriver
	 *
	 * ExcelReader Logs WebDriverWait ExtentReports
	 *
	 *
	 *
	 */
	public static WebDriver driver;
	public static WebDriverWait wait;
	public static String browser;
	public static String env;
	public static FileInputStream fis;
//	public static Logger log = Logger.getLogger("devpinoyLogger");
	public static ExtentTest extentReport;
	public static SoftAssert softAssert;
	// public static ExtentReports rep = ExtentManager.getInstance();
	//This is to set default wait for every method
	public static Integer waitInSeconds = 5;

	//This is the default path to data package
	public static final String excelFilePath = System.getProperty("user.dir") + "\\src\\test\\resources\\data\\";
	
	//This is the default path to imageUpload
	public static final String imagePath = System.getProperty("user.dir") + "\\src\\test\\resources\\images\\";
	
	//This is excel file name
	public static final String potentialClientExcel = "potentialClientTestData";
	//This is column name from which we need to get row
	public static final String colName = "env";
	//This is row index of environment column from which we need to get data	
	public static int rowIndex = 0;
	
	static String metamaskExtension = System.getProperty("user.dir")+ File.separator +"src"+ File.separator +"test"+ File.separator+ "resources" + File.separator+ "extension" + File.separator +"metamask.crx";
	

	public WebDriver initConfiguration() {
		WebDriver localD = null;
		String osName = System.getProperty("os.name");
//		if (osName.contains("Windows")) {
//			excelFilePath = System.getProperty("user.dir") + "\\src\\test\\resources\\data\\";
//			imagePath = System.getProperty("user.dir") + "\\src\\test\\resources\\images\\";
//		} else {
//			excelFilePath = System.getProperty("user.dir") + "/src/test/resources/data/";
//			imagePath = System.getProperty("user.dir") + "/src/test/resources/images/";
//		}
		System.out.println("OS : " + osName);
		System.out.println("User Dir : " + System.getProperty("user.dir"));
		System.out.println("excelFilePath  : " + excelFilePath);
		System.out.println("imagePath   : " + imagePath);
		extentReport = ExtentListeners.testReport.get();
		softAssert = new SoftAssert();

		System.out.println("OS : " + System.getProperty("os.name"));
		System.out.println("User Dir : " + System.getProperty("user.dir"));
		if (System.getenv("browser") != null && !System.getenv("browser").isEmpty()) {
			browser = System.getenv("browser");
			System.out.println("Browser: " + browser);
		} else {
			browser = PropertiesReader.getPropertyValue("browser");
		}
		if (System.getenv("env") != null && !System.getenv("env").isEmpty()) {
			env = System.getenv("env");
			System.out.println("Env: " + env);
		} else {
			env = PropertiesReader.getPropertyValue("env");
		}
		if (browser.equals("firefox")) {
			System.setProperty("webdriver.gecko.driver", "gecko.exe");
			localD = new FirefoxDriver();
//			log.debug("Firefox Driver initialized");
		} else if (browser.equals("chrome")) {

			WebDriverManager.chromedriver().setup();
			Map<String, Object> prefs = new HashMap<String, Object>();
			prefs.put("profile.default_content_setting_values.notifications", 2);
			prefs.put("credentials_enable_service", false);
			prefs.put("profile.password_manager_enabled", false);
			ChromeOptions options = new ChromeOptions();
			options.addExtensions(new File(metamaskExtension));
			options.setExperimentalOption("prefs", prefs);
			String agentString = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36";
			options.addArguments("--user-agent=" + agentString);
			options.addArguments("window-size=1920,1080");
			options.addArguments("--disable-gpu");
			//options.addArguments("--headless");
			

//			options.addArguments("--disable-gpu");
			try {
				localD = new ChromeDriver(options);
			} catch (Exception e) {
				e.printStackTrace();
			}

//			driver.manage().window().maximize();
//			log.debug("Chrome driver intialized");
		} else if (browser.equals("ie")) {
			System.setProperty("webdriver.ie.driver",
					System.getProperty("user.dir") + "\\src\\test\\resources\\executables\\IEDriverServer.exe");
			localD = new InternetExplorerDriver();
		}
		localD.manage().timeouts().pageLoadTimeout(10, TimeUnit.SECONDS);
		driver=localD;
		driver.manage().deleteAllCookies(); //delete all cookies
		waitTime(3000);
		clearData();
		String current = driver.getWindowHandle();
		ArrayList<String> tabs2 = new ArrayList<String> (driver.getWindowHandles());
		for(String tab:tabs2){
			if(!tab.equals(current)) {
				driver.switchTo().window(tab);
				driver.close();
			}
		}
		driver.switchTo().window(current);
		return localD;
	}
	
	public void openNewTab() {
		((JavascriptExecutor)driver).executeScript("window.open('about:blank','_blank');");
	}
	
	public void clearData() {
		driver.get("chrome://settings/clearBrowserData");
		((JavascriptExecutor)driver).executeScript("window.localStorage.clear()","");
		((JavascriptExecutor)driver).executeScript("window.sessionStorage.clear()","");
	}
	
	public void initMetamask() {
		waitTime(3000);
//		ArrayList<String> tabs2 = new ArrayList<String> (driver.getWindowHandles());
//	    driver.switchTo().window(tabs2.get(1));
		driver.get("chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#initialize/welcome");
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
	    waitTime(3000);
	    clickOnTextContains("Import");
	    waitTime(3000);
	    clickOnTextContains("All done");
	    waitTime(3000);
	    //driver.close();
	    //driver.switchTo().window(tabs2.get(0));
	}
	
	public void waitForTextContains(String text,int timeoutInSeconds) {
		WebDriverWait wait = new WebDriverWait(driver, timeoutInSeconds);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("(//*[contains(text(),'"+text+"')])[last()]")));
	}
	
	public void clickOnTextContains(String value) {
		try {
			WebElement ele = driver.findElement(By.xpath("(//*[contains(text(),'"+value+"')])[last()]"));
			scrollIntoViewSmoothly(ele);
			waitTime(2000);
			click(ele);
		} catch (Exception e) {
		}
	}


	public static void openURL(String key) {
//		env = PropertiesReader.getPropertyValue("env");
//		log.debug("Environment value:" + env);
		driver.get(PropertiesReader.getPropertyValue(env + "_" + key));
		driver.manage().window().maximize();
		driver.manage().timeouts().implicitlyWait(Integer.parseInt(PropertiesReader.getPropertyValue("implicit.wait")),
				TimeUnit.SECONDS);

	}
	
	public static void navigateToURL(String value) {
		driver.get(value);
		driver.manage().window().maximize();
		driver.manage().timeouts().implicitlyWait(Integer.parseInt(PropertiesReader.getPropertyValue("implicit.wait")),
				TimeUnit.SECONDS);
	}

	public static String loginDetails(String key) {
//		env = PropertiesReader.getPropertyValue("env");
		return PropertiesReader.getPropertyValue(env + "_" + key);
	}

	public static void click(WebElement element) {
		try {
			waitForElementVisibility(element, "30");
			waitForElementClickable(element, "20");
			element.click();
		}catch(Exception e) {}
		

//		log.debug("Clicking on an Element : " + element);
//ExtentListeners.testReport.get().log(Status.INFO, "Clicking on : " + element);
//extentReport.log(Status.INFO,"Clicking on : " + element);
//		ErrorCollector.extentLogInfo("Clicking on : " + element);
	}
	
	public void scrollIntoViewSmoothly(WebElement Element) {
        JavascriptExecutor je = (JavascriptExecutor) driver;
        je.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})", Element);
    }

	public static void click(WebElement element, String timeInSeconds) {
		waitForElementVisibility(element, timeInSeconds);
		waitForElementClickable(element, timeInSeconds);
		element.click();
//		log.debug("Clicking on : " + element);
//		ErrorCollector.extentLogInfo("Clicking on : " + element);
	}

	public static void waitForElementVisibility(WebElement element, String timeoutInSeconds) {

		WebDriverWait wait = new WebDriverWait(driver, Long.parseLong(timeoutInSeconds));
		wait.until(ExpectedConditions.visibilityOf(element));
		// ExtentListeners.testReport.get().log(Status.INFO, "Waiting for on : " +
		// element);
//	ExtentListeners.testReport.get().log(Status.INFO,"Waiting for on : " + element);
//	extentReport.log(Status.INFO,"Opening browser");
//		ErrorCollector.extentLogInfo("Waiting for element: " + element);
//		log.info("Waiting for element visible: " + element);
	}

	public static void waitForElementClickable(WebElement element, String timeoutInSeconds) {
		WebDriverWait waitClickable = new WebDriverWait(driver, Long.parseLong(timeoutInSeconds));
		waitClickable.until(ExpectedConditions.elementToBeClickable(element));
//		log.info("Waiting for element " + element);
//		ErrorCollector.extentLogInfo("Waiting for element clickable: " + element);
	}
	
	public void waitUntilSearchLoadingShowing() {
		try {
		WebElement element=driver.findElement(By.xpath("//*[@class='css-1bg64dd']"));
		waitUntilElementDisplayed(element, driver);
		}catch (Exception e) {
		}
	}

	public static void waitUntilElementDisplayed(final WebElement webElement, WebDriver driver) {
		driver.manage().timeouts().implicitlyWait(0, TimeUnit.SECONDS);
		WebDriverWait wait = new WebDriverWait(driver, 20);
		ExpectedCondition elementIsDisplayed = new ExpectedCondition<Boolean>() {
			public Boolean apply(WebDriver arg0) {
				try {
					webElement.isDisplayed();
					return true;
				} catch (NoSuchElementException e) {
					return false;
				} catch (StaleElementReferenceException f) {
					return false;
				}
			}
		};
		wait.until(elementIsDisplayed);
		driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	public static void type(WebElement element, String value) {
		waitForElementVisibility(element, "20");
		waitForElementClickable(element, "10");
		element.clear();
		System.out.println("Entered :" + value);
		element.sendKeys(value);
//		log.debug("Typing in an Element : " + element + " entered value as : " + value);
//		ErrorCollector.extentLogInfo("Typing in an Element : " + element + " entered value as : " + value);
	}

	public static void type_old(WebElement element, String value) {
		element.sendKeys(value);
//		log.debug("Typing in an Element : " + element + " entered value as : " + value);
//ExtentListeners.testReport.get().log(Status.INFO, "Typing in : " + element+" entered vaue as: "+value);
//test.log(LogStatus.INFO, "Typing in : " + element + " entered value as " + value);
//		ErrorCollector.extentLogInfo("Typing in an Element : " + element + " entered value as : " + value);
	}

	public static void selectValueFromDropdown(List<WebElement> dropdownValues, String value) {
		for (WebElement ele : dropdownValues) {
			System.out.println("Actual :" + ele.getText() + ":");
			System.out.println("Excepted :" + value + ":");
			if (ele.getText().trim().equals(value)) {
				click(ele);
				break;
			}
		}
//		log.info("Selecting values : " + value);
//		ErrorCollector.extentLogInfo("Selecting values : " + value);
	}

	public void multipleSelectFromDropDown(WebElement searchBox, List<WebElement> elementList, String... inputValues) {

		for (String inputValue : inputValues) {
			type(searchBox, inputValue);
			for (WebElement value : elementList) {
				if (value.getText().equals(inputValue)) {
					click(value);
					break;
				}
			}
		}
//		log.info("Selecting values : " + inputValues);
//		ErrorCollector.extentLogInfo("Selecting values : " + inputValues);
	}

	public void scrollUp() {
		JavascriptExecutor js = (JavascriptExecutor) driver;
		js.executeScript("scroll(0,-250)");
	}

	public void scrollDown() {
		JavascriptExecutor js = (JavascriptExecutor) driver;
		js.executeScript("scroll(0,2500)");
	}

	public void scrollIntoView(WebElement Element) {
		JavascriptExecutor je = (JavascriptExecutor) driver;
		je.executeScript("arguments[0].scrollIntoView();", Element);
	}

	public void clickUsingJavascriptExecutor(WebElement button) {
		JavascriptExecutor js = (JavascriptExecutor) driver;
		js.executeScript("arguments[0].click();", button);
	}

	public void mouseHoverAndClick(WebElement button) {
		Actions actions = new Actions(driver);
		actions.moveToElement(button);
		actions.click().build().perform();
//		log.info("Clicking : " + button);
//		ErrorCollector.extentLogInfo("Clicking : " + button);
	}

	public void mouseHover(WebElement button) {
		Actions actions = new Actions(driver);
		actions.moveToElement(button);
//		log.info("Clicking : " + button);
//		ErrorCollector.extentLogInfo("Clicking : " + button);
	}
	
	public boolean isTextPresent(String text) {
		return driver.findElements(By.xpath("//*[contains(text(),'"+text+"')]")).size()>0;
	}

	public static boolean isElementDisplayed(WebElement element) {
		try {
			if(element.isDisplayed()) {
			return true;
			}
			else {
				return false;
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
			return false;
		}
	}

	public static boolean isElementSelected(WebElement status) {
		if (status.isSelected()) {
			return true;
		} else {
			return false;
		}
	}

	public static boolean isElementEnabled(WebElement status) {
		if (status.isEnabled()) {
			return true;
		} else {
			return false;
		}
	}

	public Object[][] getData(String filename, String SheetName) {

		ExcelReader excel = new ExcelReader(
				System.getProperty("user.dir") + "\\src\\test\\resources\\data\\" + filename + ".xlsx");
		int rows = excel.getRowCount(SheetName);
		int columns = excel.getColumnCount(SheetName);

		Object[][] data = new Object[rows - 1][columns];

		for (int rowNum = 2; rowNum <= rows; rowNum++) {
			for (int colNum = 0; colNum < columns; colNum++) {

				data[rowNum - 2][colNum] = excel.getCellData(SheetName, colNum, rowNum);
			}
		}
		return data;
	}

	public static void waitTime(int time) {
		try {
			Thread.sleep(time);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}

	public static void quitBrowser() {
//		log.info("Quitting browser");
//		ErrorCollector.extentLogInfo("Quitting browser");
		//driver.quit();
	}

	public static void closeBrowser() {
//		log.info("Closing browser");
//		ErrorCollector.extentLogInfo("Closing browser");
		//driver.close();
	}

	public static WebDriver getDriver() {
		return driver;
	}

	public static String getTitle() {
		return driver.getTitle();
	}

	public static String getUniqueData(String value) {
		SimpleDateFormat formatter = new SimpleDateFormat("MMddyyHmm");
		Date date = new Date();
		String unique = formatter.format(date).toString();
		String uniqueValue = value + unique;
		formatter.formatToCharacterIterator(uniqueValue);
		return uniqueValue;		
	}

	public static String getUniqueEmailId(String value) {	
	
		SimpleDateFormat formatter = new SimpleDateFormat("MMddyyHmm");
		Date date = new Date();
		String unique = formatter.format(date).toString();
		String uniqueEmailId = value + unique + "@test.com";
		return uniqueEmailId;
		}
	
	public static String getElementText(WebElement element) {
		//waitForElementVisibility(element, "10");
		return element.getText().trim();
	}
	
	public static String getSystemDateInMMDDYYYYFormat() {
		
		DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MM/dd/yyyy");  
		   LocalDateTime now = LocalDateTime.now();  
		   System.out.println("Dater : " + dtf.format(now)); 
		   return dtf.format(now);
		
	}

	public static void teardown() {
//		log.info("Closing the test script in teardown");
//		ErrorCollector.extentLogInfo("Closing the test script in teardown");
		closeBrowser();
	}
	
	public static void getRefreshWebPage() {
		waitTime(5000);
		driver.navigate().refresh();
		waitTime(5000);
	}
	//Scroll Into Specific view
	public void scrollIntoSpecificView(WebElement Element) {
		JavascriptExecutor je = (JavascriptExecutor) driver;
		je.executeScript("scroll(0,1000)");
	}
	//Scroll Into Specific view
		public void scrollIntoSpecificViewInvoicesAction(WebElement Element) {
			JavascriptExecutor je = (JavascriptExecutor) driver;
			je.executeScript("scroll(0,1600)");
		}

	@AfterTest
	public void tearDown() {

		BaseClass.quitBrowser();
	}
	/*
	methodName : scrollToElement
	description : This method will scroll to given element, 
		 	It'll accept element as parameter before scrolling. 
	Parameters : 
			 WebElement element (Element to be scrolled)
	Created By : Muhammad Abu Bakar
	Created On : 02/18/2021 (Date-format : MM/dd/yyyy)
	*/
	
	public static void scrollToElement(WebElement element) {
			((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", element);			
			((JavascriptExecutor) driver).executeScript("window.scrollTo( 0, -150)");
			boolean isDisplay = isElementDisplayed(element);
			if(!isDisplay) {
				((JavascriptExecutor) driver).executeScript("window.scrollTo( 0, -100)");							
			}
	}
	/*
	Method Name : click
	Description : This method will click on some element, 
		 	It'll accept element, time to wait before click and message as parameters to be added in report. 
	Parameters : 
			 WebElement element (Element to be clicked)
			 int timeInSecond (Time to wait before click in second )
			 String elementMessage (Message to logged into report)
	Created By : Muhammad Abu Bakar
	Created On : 02/18/2021 (Date-format : MM/dd/yyyy)
	*/
	
	public void click(WebElement element, int timeInSecond, String message) {
			waitTime(5000);
			waitForElementVisibility(element, Integer.toString(timeInSecond));
			waitForElementClickable(element, Integer.toString(timeInSecond));
			scrollToElement(element);
			try {
				element.click();				
			}
			catch (Exception e) {
				printString("Failed to Click through click method : " + e.toString());
				printString("Trying to Click through javascript");
				scrollIntoView(element);
				clickUsingJavascriptExecutor(element);				
			}
		printString("Clicked " + message);
		ErrorCollector.extentLogInfo("Clicked " + message);									
	}


	/*
	MethodName : printString
	Description : This method will print given message on console, 
		 	It'll accept String value to be printed on console. 
	Purpose : BaseClass is accessable to every TestClass. Hence shorter way to print message.
	Parameters : 
			 String message (Message to be print on console)
	Created By : Muhammad Abu Bakar
	Created On : 02/22/2021 (Date-format : MM/dd/yyyy)
	*/
	
	public static void printString(String message) {
		try {
			System.out.println(message);			
		}catch (Exception e) {
			e.printStackTrace();
		}
	}
	/*
	Method Name : getElementAttributeValue
	Description : This method will return the value of a given attribute for the given element
	Parameters : 
			 WebElement element (Element to get)
			 String attribute (attribute name)
	Created By : Muhammad Abu Bakar
	Created On : 02/27/2021 (Date-format : MM/dd/yyyy)
	*/

	public String getElementAttributeValue(WebElement element, String attribute) {	
		waitTime(waitInSeconds);
		waitForElementVisibility(element, Integer.toString(waitInSeconds));
		scrollToElement(element);		
		return element.getAttribute(attribute);
	}

	/*
	Method Name : getDate
	Description : This method will return date for given format, 
	Parameters : 
			int Day (Day for which dates to be generate from current date)
			String formate (format in which date is required)
	Created By : Muhammad Abu Bakar
	Created On : 02/24/2021 (Date-format : MM/dd/yyyy)
	*/
/*
	public String getDate(int Day, String formateStr) {
		SimpleDateFormat format = new SimpleDateFormat(formateStr);
		final Date date = new Date();
		final Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		calendar.add(Calendar.DAY_OF_YEAR, Day);
		return format.format(calendar.getTime());
	} */

	/*
	Method Name : clear
	Description : This method will clear a field using clear method, 
	Parameters : 
			 WebElement element (Element from which text need to be removed)
			 String message (Message to logged into report)
	Created By : Muhammad Abu Bakar
	Created On : 02/26/2021 (Date-format : MM/dd/yyyy)
	*/

	public void clear(WebElement element, int timeInSecond, String message) {
	
		waitForElementVisibility(element, Integer.toString(timeInSecond));
		scrollToElement(element);
		element.clear();
		printString("Clearing  " + message);
		ErrorCollector.extentLogInfo("Clearing  " + message);				
	
	}
	
	
	public static void scrollToAddPaymentsElement(WebElement element) {
		try {
			((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", element);			
			((JavascriptExecutor) driver).executeScript("scrollBy(0, -350)");
		}catch (Exception e) {
			e.printStackTrace();
			boolean isDisplay = isElementDisplayed(element);
			if(!isDisplay) {
				//((JavascriptExecutor) driver).executeScript("window.scrollTo( 0, 50)");							
			}
		}
	}

	/*
	Method Name : getCellRowNum
	Description : This method will return row number of specific value passed in parameter. 
	Below variables are declared as constant in start		
			String filename (FileName from which we need index of value.)
			String colName (Column name from which data needs to be read.)

	Parameters : 
			String filename (FileName from which we need index of value.)
		 	String sheetName (Sheetname from which we need index of value.)
			 String cellValue (Cell value from which data needs to be read.)
	Created By : Muhammad Abu Bakar
	Created On : 03/01/2021 (Date-format : MM/dd/yyyy)
	*/

	public int getCellRowNum(String fileName, String sheetName,String cellValue){
		ExcelReader excelReader = new ExcelReader(excelFilePath + fileName + ".xlsx");	

		for(int i=2;i<=excelReader.getRowCount(sheetName);i++){
	    	if(excelReader.getCellData(sheetName,colName , i).equalsIgnoreCase(cellValue)){
	    		return i;
	    	}
	    }
		return -1;		
	}

	/*
	Method Name : loadExcel
	Description : This method will return data from excelsheet
	also it'll set data provider
	Parameters : 
			 String sheetName (Sheetname from which we need index of value.)
			 Strign env(Environment)
	Created By : Muhammad Abu Bakar
	Created On : 03/03/2021 (Date-format : MM/dd/yyyy)
	*/
	
    public Object[][] loadExcel(String fileName, String sheetName, String env) {
        int dataIndex = getCellRowNum(fileName, sheetName, env);
        printString("dataIndex : " + dataIndex);
        ErrorCollector.verifyTrue(dataIndex > -1, "Verified Excel sheet '" + sheetName + "' has data for '"+ env +"' environment");
        rowIndex = dataIndex - 2;
        return getData(fileName, sheetName);
    }

	/*
	Method Name : generateRandomNumberWithGivenNumberOfDigits
	Description : This method will generate random number to attach wiht string.
	This helps when there are lot of entries and you need verify your entry.
	Parameters : 
			int number : (enter number to which you want to generate random number i.e : 2 will generate random number with two values : 34)
	Created By : Muhammad Abu Bakar
	Created On : 03/04/2021 (Date-format : MM/dd/yyyy)
	*/
	
    public static String generateRandomNumberWithGivenNumberOfDigits(int number) {
		String randomNumber = "123456789";
		StringBuilder sb = new StringBuilder(number);
		for (int i = 0; i < number; i++) {
			int index = (int) (randomNumber.length() * Math.random());
			sb.append(randomNumber.charAt(index));
		}
		return sb.toString();
	}

	/*
	Method Name : click
	Description : This method will click on some element, 
		 	It'll accept element, time to wait before click and message as parameters to be added in report. 
	Parameters : 
			 WebElement element (Element to be clicked)
			 int timeInSecond (Time to wait before click in second )
			 String elementMessage (Message to logged into report)
	Created By : Muhammad Abu Bakar
	Created On : 02/18/2021 (Date-format : MM/dd/yyyy)
	*/
	
	public void click(WebElement element, int timeInSecond) {
			waitTime(5000);
			waitForElementVisibility(element, Integer.toString(timeInSecond));
			waitForElementClickable(element, Integer.toString(timeInSecond));
			scrollToElement(element);
			try {
				element.click();				
			}
			catch (Exception e) {
				printString("Failed to Click through click method : " + e.toString());
				printString("Trying to Click through javascript");
				clickUsingJavascriptExecutor(element);				
			}
	}

	/*
	Method Name : type
	Description : This method will enter value in some input element, 
		 	It'll accept element, time to wait before entering value and message as parameters to be added in report. 
	Parameters : 
			 WebElement element (Element to which we need to send value)
			 int timeInSecond (Time to wait before entering value in second )
			 String message (Message to logged into report)
			 String value (value to be entered in element)
	Created By : Muhammad Abu Bakar
	Created On : 02/18/2021 (Date-format : MM/dd/yyyy)
	*/
	
	public void type(WebElement element, int timeInSecond, String value) {
			waitForElementVisibility(element, Integer.toString(timeInSecond));
			waitForElementClickable(element, Integer.toString(timeInSecond));
			scrollToElement(element);
			element.clear();
			element.sendKeys(value);
	}

	/*
	Method Name : getDate
	Description : This method will return date for given format, 
	Parameters : 
			int Day (Day for which dates to be generate from current date)
			String formate (format in which date is required)
	Created By : Muhammad Abu Bakar
	Created On : 02/24/2021 (Date-format : MM/dd/yyyy)
	*/

	public String getDate(int Day, String formateStr) {
		SimpleDateFormat format = new SimpleDateFormat(formateStr);
		final Date date = new Date();
		final Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		calendar.add(Calendar.DAY_OF_YEAR, Day);
		return format.format(calendar.getTime());
	}
	

	/*
	Method Name : clear
	Description : This method will clear a field using clear method, 
	Parameters : 
			 WebElement element (Element from which text need to be removed)
			 String message (Message to logged into report)
	Created By : Muhammad Abu Bakar
	Created On : 02/26/2021 (Date-format : MM/dd/yyyy)
	*/

	public void clear(WebElement element, int timeInSecond) {
	
		waitForElementVisibility(element, Integer.toString(timeInSecond));
		scrollToElement(element);
		element.clear();	
	}

	/*
	Method Name : getInputText
	Description : This method will getText of an input field, 
	Parameters : 
			 WebElement element (input Element to get text)
	Created By : Muhammad Abu Bakar
	Created On : 02/24/2021 (Date-format : MM/dd/yyyy)
	*/

	public String getInputText(WebElement element) {	
		waitTime(waitInSeconds);
		waitForElementVisibility(element, Integer.toString(waitInSeconds));
		scrollToElement(element);		
		return element.getAttribute("value");
	}

	/*
	Method Name : clearThroughRobot
	Description : This method will clear a field suing robot class, 
	Parameters : 
			 WebElement element (Element from which text need to be removed)
			 String message (Message to logged into report)
	Created By : Muhammad Abu Bakar
	Created On : 02/26/2021 (Date-format : MM/dd/yyyy)
	*/
		
	public void clearThroughRobot(WebElement element, String message) {
		click(element, waitInSeconds);
		Robot robot;
		try {
			robot = new Robot();
			robot.keyPress(KeyEvent.VK_CONTROL);
			robot.keyPress(KeyEvent.VK_A);
			robot.keyPress(KeyEvent.VK_DELETE);
		} catch (AWTException e) {
			ErrorCollector.addVerificationFailure(e);
		}
		
	}

	/*
	Method Name : typeKeys
	Description : This method will enter keys in some input element, 
		 	It'll accept element, time to wait before entering keys and message as parameters to be added in report. 
	Parameters : 
			 WebElement element (Element to which we need to send keys)
			 int timeInSecond (Time to wait before entering value in second )
			 String message (Message to logged into report)
			 String value (value to be entered in element)
	Created By : Muhammad Abu Bakar
	Created On : 02/18/2021 (Date-format : MM/dd/yyyy)
	*/
	
	public void typeKeys(WebElement element, Keys Key) {
			waitForElementVisibility(element, Integer.toString(waitInSeconds));
			waitForElementClickable(element, Integer.toString(waitInSeconds));
			scrollToElement(element);
			element.clear();
			element.sendKeys(Key);
	}
}
