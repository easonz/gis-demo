package org.eason.webgis.servlet;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.InputStreamRequestEntity;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.eason.webgis.utils.HttpClientUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



public class CgiServlet extends HttpServlet {
	
	private final static Logger logger  = LoggerFactory.getLogger(CgiServlet.class);
	
	private static final long serialVersionUID = 1L;
    private static final String STRING_CONTENT_TYPE_HEADER_NAME = "Content-Type";
    private static final String STRING_CONTENT_LENGTH_HEADER_NAME = "Content-Length";
    private static final File FILE_UPLOAD_TEMP_DIRECTORY = new File(System.getProperty("java.io.tmpdir"));
	
	/**
	 * 
	 */
	public void init(ServletConfig servletConfig) {

	}
	
	/**
	 * 
	 */
	public void doGet (HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
    		throws IOException, ServletException {
		
		logger.info("GET  : {}", httpServletRequest.getPathInfo());
		
		// Create a GET request
		GetMethod getMethodProxyRequest = new GetMethod(getProxyURL(httpServletRequest));
		// Forward the request headers
		setProxyRequestHeaders(httpServletRequest, getMethodProxyRequest);
		
		executeProxyRequest(getMethodProxyRequest, httpServletRequest, httpServletResponse);
	}
	
	/**
	 * 
	 */
	public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
        	throws IOException, ServletException {
		
		logger.info("POST : {}", httpServletRequest.getPathInfo());

		// Create a standard POST request
    	PostMethod postMethodProxyRequest = new PostMethod(getProxyURL(httpServletRequest));
		// Forward the request headers
		setProxyRequestHeaders(httpServletRequest, postMethodProxyRequest);
    	// Check if this is a mulitpart (file upload) POST
		
    	if(ServletFileUpload.isMultipartContent(httpServletRequest)) {
    		HttpClientUtil.handleError502(httpServletRequest, httpServletResponse);
    	} else {
    		handlePost(postMethodProxyRequest, httpServletRequest);
    	}
    	// Execute the proxy request
    	executeProxyRequest(postMethodProxyRequest, httpServletRequest, httpServletResponse);
    }
    
	/**
	 * 
	 * <p>Description:</p>
	 *
	 * @param postMethodProxyRequest
	 * @param httpServletRequest
	 * @throws IOException
	 * void
	 */
    private void handlePost(PostMethod postMethodProxyRequest, HttpServletRequest httpServletRequest) throws IOException {
		RequestEntity requestEntity = new InputStreamRequestEntity(httpServletRequest.getInputStream());
		postMethodProxyRequest.setRequestEntity(requestEntity);
    }
    
    /**
     * 
     * <p>Description:</p>
     *
     * @param httpMethodProxyRequest
     * @param httpServletRequest
     * @param httpServletResponse
     * @throws IOException
     * @throws ServletException
     * void
     */
    private void executeProxyRequest(
    		HttpMethod httpMethodProxyRequest,
    		HttpServletRequest httpServletRequest,
    		HttpServletResponse httpServletResponse)
    			throws IOException, ServletException {
    	
		// Create a default HttpClient
    	HttpClient httpClient = HttpClientUtil.getHttpClient();
		httpMethodProxyRequest.setFollowRedirects(false);
		
		// Execute the request
		int intProxyResponseCode = httpClient.executeMethod(httpMethodProxyRequest);
		
		logger.info("proxy url : {} , {}", getProxyURL(httpServletRequest), intProxyResponseCode);
		
		// Pass response code back to the client
		httpServletResponse.setStatus(intProxyResponseCode);

        // Pass response headers back to the client
        Header[] headerArrayResponse = httpMethodProxyRequest.getResponseHeaders();
        for(Header header : headerArrayResponse) {
        	String key = header.getName();
        	String value = header.getValue();
        	//logger.info("set header [{}] : [{}]", key, value);
        	httpServletResponse.addHeader(key, value);
        }
        
        // Pass the response content to the client
        InputStream inputStreamProxyResponse = httpMethodProxyRequest.getResponseBodyAsStream();
        BufferedInputStream bufferedInputStream = new BufferedInputStream(inputStreamProxyResponse);
        ServletOutputStream sos = httpServletResponse.getOutputStream();
        int intNextByte;
        int size = 0;
        while ( ( intNextByte = bufferedInputStream.read() ) != -1 ) {
        	size++;
        	sos.write(intNextByte);
        }
        sos.close();
        logger.info("page size [{}]", size);
    }
    
    public String getServletInfo() {
        return "OpenLayers proxy Servlet";
    }

    /**
     * 
     * <p>Description:</p>
     *
     * @param httpServletRequest
     * @param httpMethodProxyRequest
     * void
     */
	private void setProxyRequestHeaders(HttpServletRequest httpServletRequest, HttpMethod httpMethodProxyRequest) {
    	// Get an Enumeration of all of the header names sent by the client
		Enumeration enumerationOfHeaderNames = httpServletRequest.getHeaderNames();
		while(enumerationOfHeaderNames.hasMoreElements()) {
			String stringHeaderName = (String) enumerationOfHeaderNames.nextElement();
			if(stringHeaderName.equalsIgnoreCase(STRING_CONTENT_LENGTH_HEADER_NAME))
				continue;
			// As per the Java Servlet API 2.5 documentation:
			//		Some headers, such as Accept-Language can be sent by clients
			//		as several headers each with a different value rather than
			//		sending the header as a comma separated list.
			// Thus, we get an Enumeration of the header values sent by the client
			Enumeration enumerationOfHeaderValues = httpServletRequest.getHeaders(stringHeaderName);
			while(enumerationOfHeaderValues.hasMoreElements()) {
				String stringHeaderValue = (String) enumerationOfHeaderValues.nextElement();
				Header header = new Header(stringHeaderName, stringHeaderValue);
				// Set the same header on the proxy request
				httpMethodProxyRequest.setRequestHeader(header);
			}
		}
    }
    
	/**
	 * 
	 * <p>Description:</p>
	 *
	 * @param httpServletRequest
	 * @return
	 * String
	 */
    private String getProxyURL(HttpServletRequest httpServletRequest) {
		// get the target url
		String stringProxyURL = httpServletRequest.getParameter("url");
		return stringProxyURL;
    }
}