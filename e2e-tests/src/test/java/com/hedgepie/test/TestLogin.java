package com.hedgepie.test;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jaxen.expr.Step;
import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import com.hedgepie.base.BaseClass;
import com.hedgepie.base.PropertiesReader;
import com.hedgepie.errorCollectors.ErrorCollector;
import com.hedgepie.pages.Dashboard;

import net.bytebuddy.asm.Advice.OnDefaultValue;

public class TestLogin extends BaseClass{
	Dashboard lp;

	

@Test 
	public void LoginWithInvalidCredentials(){

		    initConfiguration();
			lp = new Dashboard();
			ErrorCollector.extentLogInfo("Step 1 : Visit web url");
			openURL("AppURL");
			
			ErrorCollector.extentLogInfo("Step 2 : Click on login button");
			lp.clickOnLoginButton();
			
			String email = PropertiesReader.getPropertyValue(env + "_EmailId");
			ErrorCollector.extentLogInfo("Step 3 : Enter Email : "+email);
			lp.enterEmail(email);

			String pass = PropertiesReader.getPropertyValue(env + "_Password");
			ErrorCollector.extentLogInfo("Step 4 : Enter Password : "+pass);
			lp.enterPassword(pass);
			
			ErrorCollector.extentLogInfo("Step 5 : Click on Login button");
			lp.clickOnLoginButton();
			
			ErrorCollector.extentLogInfo("Step 6 : Verify Error Message is displaying");
			waitTime(3000);
			ErrorCollector.verifyTrue(lp.isInvalidCredentialsErrorMessageDisplaying(),"Verified User Dashboard is displaying");
			//driver.close();
			
	}
}