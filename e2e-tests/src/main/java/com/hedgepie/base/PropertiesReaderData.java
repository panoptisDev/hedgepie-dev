package com.hedgepie.base;

//Properties Reader class
	import java.io.FileInputStream;
	import java.io.IOException;
	import java.io.InputStream;
	import java.util.Properties;

	public class PropertiesReaderData {
           public static Properties dataFile = new Properties();
           
           public static Properties readProp() {
           FileInputStream fis = null;
     try {
            fis = new FileInputStream(System.getProperty("user.dir")+ "\\src\\test\\resources\\config\\Config.properties");
            	dataFile.load(fis);
         } catch (IOException e) {
        	 e.printStackTrace();
 // log.warn(e.getMessage());//added for logging
                  }
        return dataFile;
       }

           
           public static Properties readPropFromData(String fileName) {
               FileInputStream fis = null;
         try {
                fis = new FileInputStream(System.getProperty("user.dir")+ "\\src\\test\\resources\\data\\"+fileName+".properties");
                	dataFile.load(fis);
             } catch (IOException e) {
            	 e.printStackTrace();
     // log.warn(e.getMessage());//added for logging
                      }
            return dataFile;
           }

       public static String getPropertyValueFromData(String prop) {
               String propertyValue = null;
          try {
               propertyValue = readProp().getProperty(prop).toLowerCase();
               if (propertyValue.isEmpty()) {
              throw new NullPointerException();
              }
            } catch (Exception e) {
              e.printStackTrace();
         // log.info(e.getMessage() + " for property: " + prop);//added for
         // logging
        }
       return propertyValue;
       }
        
           
      public static String getPropertyValue(String prop) {
                 String propertyValue = null;
            try {
                 propertyValue = readProp().getProperty(prop).toLowerCase();
                 if (propertyValue.isEmpty()) {
                throw new NullPointerException();
                }
              } catch (Exception e) {
                e.printStackTrace();
           // log.info(e.getMessage() + " for property: " + prop);//added for
           // logging
          }
         return propertyValue;
         }
	}


