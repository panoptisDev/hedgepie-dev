package com.hedgepie.listeners;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.FileUtils;
import org.testng.ISuite;
import org.testng.ISuiteListener;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.markuputils.ExtentColor;
import com.aventstack.extentreports.markuputils.Markup;
import com.aventstack.extentreports.markuputils.MarkupHelper;
import com.hedgepie.base.BaseClass;

public class ExtentListeners implements ITestListener, ISuiteListener {

	static Date d = new Date();
	static String fileName = "Extent_Report.html";
	static Map<Integer,ExtentTest> extentTestMap = new HashMap<Integer,ExtentTest>();
	private static ExtentReports extent = ExtentManager.createInstance(System.getProperty("user.dir")+"\\reports\\"+fileName);
	
	public static ThreadLocal<ExtentTest> testReport = new ThreadLocal<ExtentTest>();
	
	public void onTestStart(ITestResult result) {

		//ExtentTest test = extent.createTest(result.getTestClass().getName()+"     @TestCase : "+result.getMethod().getMethodName());
		ExtentTest test = extent.createTest(result.getMethod().getMethodName());
		testReport.set(test); 
	}

	public void onTestSuccess(ITestResult result) {
		
		try {

			ExtentManager.captureScreenshot();
			testReport.get().pass("<b>" + "<font color=" + "green>" + "Screenshot of pass" + "</font>" + "</b>",
					MediaEntityBuilder.createScreenCaptureFromPath(ExtentManager.screenshotName)
							.build());
		} catch (IOException e) {

		}
		String methodName=result.getMethod().getMethodName();
		String logText="<b>"+"TEST CASE:- "+ methodName.toUpperCase()+ " PASSED"+"</b>";		
		Markup m=MarkupHelper.createLabel(logText, ExtentColor.GREEN);
		testReport.get().pass(m);
		BaseClass.driver.close();
	}

	public void onTestFailure(ITestResult result) {

		String excepionMessage=Arrays.toString(result.getThrowable().getStackTrace());
		testReport.get().fail("<details>" + "<summary>" + "<b>" + "<font color=" + "red>" + "Exception Occured:Click to see"
				+ "</font>" + "</b >" + "</summary>" +excepionMessage.replaceAll(",", "<br>")+"</details>"+" \n");
		
		try {

			ExtentManager.captureScreenshot();
			testReport.get().fail("<b>" + "<font color=" + "red>" + "Screenshot of failure" + "</font>" + "</b>",
					MediaEntityBuilder.createScreenCaptureFromPath(ExtentManager.screenshotName)
							.build());
		} catch (IOException e) {

		}
		
		String failureLogg="TEST CASE FAILED";
		Markup m = MarkupHelper.createLabel(failureLogg, ExtentColor.RED);
		testReport.get().log(Status.FAIL, m);
	}

	public void onTestSkipped(ITestResult result) {
		String methodName=result.getMethod().getMethodName();
		String logText="<b>"+"Test Case:- "+ methodName+ " Skipped"+"</b>";		
		Markup m=MarkupHelper.createLabel(logText, ExtentColor.YELLOW);
		testReport.get().skip(m);
	}

	public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
		// TODO Auto-generated method stub

	}

	public void onStart(ITestContext context) {

	}

	public void onFinish(ITestContext context) {

		if (extent != null) {
			extent.flush();
		}
	}
	
	public static ExtentTest getTest() {
		return (ExtentTest)extentTestMap.get((int)(long)(Thread.currentThread().getId()));
	}
	
	public static void captureErrorAndScreenshot(Throwable result) {
		String excepionMessage=Arrays.toString(result.getStackTrace());
		testReport.get().fail("<details>" + "<summary>" + "<b>" + "<font color=" + "red>" + "Exception Occured:Click to see"
				+ "</font>" + "</b >" + "</summary>" +excepionMessage.replaceAll(",", "<br>")+"</details>"+" \n");
		try {

			ExtentManager.captureScreenshot();
			testReport.get().fail("<b>" + "<font color=" + "red>" + "Screenshot of failure" + "</font>" + "</b>",
					MediaEntityBuilder.createScreenCaptureFromPath(ExtentManager.screenshotName)
							.build());
		} catch (IOException e) {

		}
	}

	@Override
	public void onStart(ISuite suite) {
		try {
			FileUtils.cleanDirectory(new File(System.getProperty("user.dir")+"/reports/"));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			//e.printStackTrace();
		}
	}

	@Override
	public void onFinish(ISuite suite) {
		// TODO Auto-generated method stub
		
	}

	
}
