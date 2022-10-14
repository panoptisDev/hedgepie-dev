package com.hedgepie.listeners;

import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.AllowAllHostnameVerifier;
import org.apache.http.conn.ssl.SSLContextBuilder;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.testng.IMethodInstance;
import org.testng.IMethodInterceptor;
import org.testng.ITestContext;

import com.hedgepie.base.BaseClass;

public class TestFilterListener extends BaseClass implements IMethodInterceptor {

	@Override
	public List<IMethodInstance> intercept(List<IMethodInstance> methods, ITestContext context) {
		ArrayList<String> testsToRun = new ArrayList<>();
		testsToRun.add("TC_38_VerifyUserShouldBeAbleToEnterMintDescriptionWhileMintingNFT");
		List<IMethodInstance> methodsToRun = new ArrayList<>();
		for (IMethodInstance method : methods) {
//			printString(method.getMethod().getMethodName());
			if (testsToRun.contains(method.getMethod().getMethodName())) {
				methodsToRun.add(method);
			}
		}
		printString("Running " + methods.size() + " Tests");
		return methods;

	}
}