package com.hedgepie.errorCollectors;

import static org.testng.Assert.assertNotEquals;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.testng.Assert;
import org.testng.ITestResult;
import org.testng.Reporter;
import org.testng.asserts.SoftAssert;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.hedgepie.base.BaseClass;
import com.hedgepie.listeners.ExtentListeners;

public class ErrorCollector {
	
	private static Map<ITestResult, List<Throwable>> verificationFailuresMap = new HashMap<ITestResult, List<Throwable>>();
	
	public static void assertTrue(boolean condition) {
    	Assert.assertTrue(condition);
    }
    
    public static void assertTrue(boolean condition, String message) {
    	Assert.assertTrue(condition, message);
    }
    
    public static void assertFalse(boolean condition) {
    	Assert.assertFalse(condition);
    }
    
    public static void assertFalse(boolean condition, String message) {
    	Assert.assertFalse(condition, message);
    }
    
    public static void assertEquals(boolean actual, boolean expected) {
    	Assert.assertEquals(actual, expected);
    }
    
    public static void assertEquals(Object actual, Object expected) {
    	Assert.assertEquals(actual, expected);
    }
    
    public static void assertEquals(Object[] actual, Object[] expected) {
    	Assert.assertEquals(actual, expected);
    }
    
    public static void assertEquals(Object actual, Object expected, String message) {
    	Assert.assertEquals(actual, expected, message);
    }
    
//Soft Asserts
    
    public static void softAssertTrue(boolean condition) {
    	BaseClass.softAssert.assertTrue(condition);
    
    }
    
    public static void softAssertTrue(boolean condition, String message) {
    	BaseClass.softAssert.assertTrue(condition, message);
    }
    
    public static void softAssertFalse(boolean condition) {
    	BaseClass.softAssert.assertFalse(condition);
    }
    
    public static void softAssertFalse(boolean condition, String message) {
    	BaseClass.softAssert.assertFalse(condition, message);
    }
    
    public static void softAssertEquals(boolean actual, boolean expected) {
    	BaseClass.softAssert.assertEquals(actual, expected);
    }
    
    public static void softAssertEquals(Object actual, Object expected) {
    	BaseClass.softAssert.assertEquals(actual, expected);
    }
    
    public static void softAssertEquals(Object[] actual, Object[] expected) {
    	BaseClass.softAssert.assertEquals(actual, expected);
    }
    
    public static void softAssertEquals(Object actual, Object expected, String message) {
    	BaseClass.softAssert.assertEquals(actual, expected, message);
    }

 //Assert verify   
    public static void verifyTrue(boolean condition) {
    	try {
    		assertTrue(condition);
    		BaseClass.extentReport.log(Status.PASS, "PASS");
    	} catch(Throwable e) {
    		BaseClass.extentReport.log(Status.FAIL, "FAIL");
    		ExtentListeners.captureErrorAndScreenshot(e);
    		addVerificationFailure(e);
    	}
    }
    
    public static void verifyTrue(boolean condition, String message) {
    	try {
    		assertTrue(condition, message);
    		BaseClass.extentReport.log(Status.PASS, "--" + message);
    	} catch(Throwable e) {
    		BaseClass.extentReport.log(Status.FAIL, "--" + message);
    		ExtentListeners.captureErrorAndScreenshot(e);
    		addVerificationFailure(e);
    	}
    }
    
    public static void verifyFalse(boolean condition) {
    	try {
    		assertFalse(condition);
    		BaseClass.extentReport.log(Status.PASS, "PASS");
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "FAIL");
			ExtentListeners.captureErrorAndScreenshot(e);
			addVerificationFailure(e);
		}
    }
    
    public static void verifyFalse(boolean condition, String message) {
    	try {
    		assertFalse(condition, message);
    		BaseClass.extentReport.log(Status.PASS, "--" +  message);
    	} catch(Throwable e) {
    		BaseClass.extentReport.log(Status.FAIL, "--" +  message);
    		ExtentListeners.captureErrorAndScreenshot(e);
    		addVerificationFailure(e);
    	}
    }
    
    public static void verifyEquals(boolean actual, boolean expected) {
    	try {
    		assertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "Expected: "+expected+" Actual: "+actual);
			ExtentListeners.captureErrorAndScreenshot(e);
    		addVerificationFailure(e);
		}
    }
    
    public static void verifyEquals(String actual, String expected) {
    	try {
    		assertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "Expected: "+expected+" Actual: "+actual);
			ExtentListeners.captureErrorAndScreenshot(e);
			addVerificationFailure(e);
		}
    }
    
    public static void verifyEquals(String actual, String expected, String failMessage) {
    	try {
    		assertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "Expected: "+expected+" Actual: "+actual+"--"+ failMessage);
			ExtentListeners.captureErrorAndScreenshot(e);
			addVerificationFailure(e);
		}
    }
    
    public static void verifyNotEquals(String actual, String expected, String failMessage) {
    	try {
    		assertNotEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "Expected: "+expected+" Actual: "+actual+"--"+ failMessage);
			ExtentListeners.captureErrorAndScreenshot(e);
			addVerificationFailure(e);
		}
    }
    
    public static void verifyEquals(List<String> actual, List<String> expected, String failMessage) {
    	try {
    		assertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "Expected: "+expected+" Actual: "+actual+"--"+failMessage);
			ExtentListeners.captureErrorAndScreenshot(e);
			addVerificationFailure(e);
		}
    }
    
    public static void verifyEquals(int actual, int expected) {
    	try {
    		assertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "Expected: "+expected+" Actual: "+actual);
			ExtentListeners.captureErrorAndScreenshot(e);
			addVerificationFailure(e);
    		
		}
    }

    public static void verifyEquals(Object actual, Object expected) {
    	try {
    		assertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "Expected: "+expected+" Actual: "+actual);
			ExtentListeners.captureErrorAndScreenshot(e);
			addVerificationFailure(e);
		}
    }
    
    public static void verifyEquals(Object[] actual, Object[] expected) {
    	try {
    		assertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "PASS");
		} catch(Throwable e) {
			BaseClass.extentReport.log(Status.FAIL, "FAIL");
			ExtentListeners.captureErrorAndScreenshot(e);
			addVerificationFailure(e);
		}
    }

    //Verify SoftAsserts
    public static void verifySoftAssertTrue(boolean condition) {
    	try {
    		softAssertTrue(condition);
    		BaseClass.extentReport.log(Status.PASS, "PASS");
    	} catch(Throwable e) {
    		addVerificationFailure(e);
    	}
    }
    
    public static void verifySoftAssertTrue(boolean condition, String message) {
    	try {
    		softAssertTrue(condition, message);
    		BaseClass.extentReport.log(Status.PASS, message);
    	} catch(Throwable e) {
    		addVerificationFailure(e);
    	}
    }
    
    public static void verifySoftAssertFalse(boolean condition) {
    	try {
    		softAssertFalse(condition);
    		BaseClass.extentReport.log(Status.PASS, "FAIL");
		} catch(Throwable e) {
    		addVerificationFailure(e);
		}
    }
    
    public static void verifySoftAssertFalse(boolean condition, String message) {
    	try {
    		softAssertFalse(condition, message);
    		BaseClass.extentReport.log(Status.PASS, message);
    	} catch(Throwable e) {
    		addVerificationFailure(e);
    	}
    }
    
    public static void verifySoftAssertEquals(boolean actual, boolean expected) {
    	try {
    		softAssertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
    		addVerificationFailure(e);
		}
    }
    
    public static void verifySoftAssertEquals(String actual, String expected) {
    	try {
    		softAssertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
    		
			addVerificationFailure(e);
    		
		}
    }
    
    
    public static void verifySoftAssertEquals(int actual, int expected) {
    	try {
    		softAssertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
    		
			addVerificationFailure(e);
    		
		}
    }

    public static void verifySoftAssertEquals(Object actual, Object expected) {
    	try {
    		softAssertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual);
		} catch(Throwable e) {
    		addVerificationFailure(e);
		}
    }
    
    public static void verifySoftAssertEquals(Object actual, Object expected, String message) {
    	try {
    		softAssertEquals(actual, expected, message);
    		BaseClass.extentReport.log(Status.PASS, "Expected: "+expected+" Actual: "+actual + " "+message);
		} catch(Throwable e) {
    		addVerificationFailure(e);
		}
    }
    
    public static void verifySoftAssertEquals(Object[] actual, Object[] expected) {
    	try {
    		softAssertEquals(actual, expected);
    		BaseClass.extentReport.log(Status.PASS, "PASS");
		} catch(Throwable e) {
    		addVerificationFailure(e);
		}
    }

    public static void extentLogInfo(String message) {
    	try {
    		 BaseClass.extentReport.log(Status.INFO, message);
		} catch(Throwable e) {
    		addVerificationFailure(e);
		}
    }
    
    public static void fail(String message) {
    	Assert.fail(message);
    }
    
	public static List<Throwable> getVerificationFailures() {
		List<Throwable> verificationFailures = verificationFailuresMap.get(Reporter.getCurrentTestResult());
		return verificationFailures == null ? new ArrayList<Throwable>() : verificationFailures;
	}
	
	public static void addVerificationFailure(Throwable e) {
		List<Throwable> verificationFailures = getVerificationFailures();
		verificationFailuresMap.put(Reporter.getCurrentTestResult(), verificationFailures);
		verificationFailures.add(e);
	}
	
}
