package org.eason.webgis.servlet;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.InputStreamRequestEntity;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.apache.commons.httpclient.methods.multipart.ByteArrayPartSource;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.methods.multipart.StringPart;
import org.eason.webgis.utils.HttpClientUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class ProxyServlet extends HttpServlet {
	
	private final static Logger logger  = LoggerFactory.getLogger(ProxyServlet.class);
	
	private static final long serialVersionUID = 1L;
    private static final String STRING_LOCATION_HEADER = "Location";
    private static final String STRING_CONTENT_TYPE_HEADER_NAME = "Content-Type";
    private static final String STRING_CONTENT_LENGTH_HEADER_NAME = "Content-Length";
    private static final String STRING_HOST_HEADER_NAME = "Host";
    private static final File FILE_UPLOAD_TEMP_DIRECTORY = new File(System.getProperty("java.io.tmpdir"));
    
    // Proxy host params
	private String stringProxyHost;
	private int intProxyPort = 80;
	private String stringProxyPath = "";
	private int intMaxFileUploadSize = 5 * 1024 * 1024;
	
	/**
	 * 
	 */
	public void init(ServletConfig servletConfig) {
		// Get the proxy host
		String stringProxyHostNew = servletConfig.getInitParameter("proxyHost");
		if(stringProxyHostNew == null || stringProxyHostNew.length() == 0) { 
			throw new IllegalArgumentException("Proxy host not set, please set init-param 'proxyHost' in web.xml");
		}
		stringProxyHost = stringProxyHostNew;
		// Get the proxy port if specified
		String stringProxyPortNew = servletConfig.getInitParameter("proxyPort");
		if(stringProxyPortNew != null && stringProxyPortNew.length() > 0) {
			intProxyPort = Integer.parseInt(stringProxyPortNew);
		}
		// Get the proxy path if specified
		String stringProxyPathNew = servletConfig.getInitParameter("proxyPath");
		if(stringProxyPathNew != null && stringProxyPathNew.length() > 0) {
			stringProxyPath  = stringProxyPathNew;
		}
		// Get the maximum file upload size if specified
		String stringMaxFileUploadSize = servletConfig.getInitParameter("maxFileUploadSize");
		if(stringMaxFileUploadSize != null && stringMaxFileUploadSize.length() > 0) {
			intMaxFileUploadSize = Integer.parseInt(stringMaxFileUploadSize);
		}
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
		
        //ServletOutputStream sos = httpServletResponse.getOutputStream();
        //sos.write("ddddddddddddddddddddddd".getBytes());
        //sos.close();
        
    	// Execute the proxy request
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
		
    	/*if(ServletFileUpload.isMultipartContent(httpServletRequest)) {
    		handleMultipartPost(postMethodProxyRequest, httpServletRequest);
    	} else {
    		handleStandardPost(postMethodProxyRequest, httpServletRequest);
    	}*/
		handlePost(postMethodProxyRequest, httpServletRequest);
    	// Execute the proxy request
    	executeProxyRequest(postMethodProxyRequest, httpServletRequest, httpServletResponse);
    }
	
	/**
	 * 
	 * <p>Description:</p>
	 *
	 * @param postMethodProxyRequest
	 * @param httpServletRequest
	 * @throws ServletException
	 * void
	 */
	private void handleMultipartPost(PostMethod postMethodProxyRequest, HttpServletRequest httpServletRequest)
    		throws ServletException {
    	// Create a factory for disk-based file items
    	DiskFileItemFactory diskFileItemFactory = new DiskFileItemFactory();
    	// Set factory constraints
    	diskFileItemFactory.setSizeThreshold(intMaxFileUploadSize);
    	diskFileItemFactory.setRepository(FILE_UPLOAD_TEMP_DIRECTORY);
    	// Create a new file upload handler
    	ServletFileUpload servletFileUpload = new ServletFileUpload(diskFileItemFactory);
    	// Parse the request
    	try {
    		// Get the multipart items as a list
    		List<FileItem> listFileItems = (List<FileItem>) servletFileUpload.parseRequest(httpServletRequest);
    		// Create a list to hold all of the parts
    		List<Part> listParts = new ArrayList<Part>();
    		// Iterate the multipart items list
    		for(FileItem fileItemCurrent : listFileItems) {
    			// If the current item is a form field, then create a string part
    			if (fileItemCurrent.isFormField()) {
    				StringPart stringPart = new StringPart(
    						fileItemCurrent.getFieldName(), // The field name
    						fileItemCurrent.getString()     // The field value
    				);
    				// Add the part to the list
    				listParts.add(stringPart);
    			} else {
    				// The item is a file upload, so we create a FilePart
    				FilePart filePart = new FilePart(
    						fileItemCurrent.getFieldName(),    // The field name
    						new ByteArrayPartSource(
    								fileItemCurrent.getName(), // The uploaded file name
    								fileItemCurrent.get()      // The uploaded file contents
    						)
    				);
    				// Add the part to the list
    				listParts.add(filePart);
    			}
    		}
    		MultipartRequestEntity multipartRequestEntity = new MultipartRequestEntity(
																listParts.toArray(new Part[] {}),
																postMethodProxyRequest.getParams()
															);
    		postMethodProxyRequest.setRequestEntity(multipartRequestEntity);
    		// The current content-type header (received from the client) IS of
    		// type "multipart/form-data", but the content-type header also
    		// contains the chunk boundary string of the chunks. Currently, this
    		// header is using the boundary of the client request, since we
    		// blindly copied all headers from the client request to the proxy
    		// request. However, we are creating a new request with a new chunk
    		// boundary string, so it is necessary that we re-set the
    		// content-type string to reflect the new chunk boundary string
    		postMethodProxyRequest.setRequestHeader(STRING_CONTENT_TYPE_HEADER_NAME, multipartRequestEntity.getContentType());
    	} catch (FileUploadException fileUploadException) {
    		throw new ServletException(fileUploadException);
    	}
    }
    
	/**
	 * 
	 * <p>Description:</p>
	 *
	 * @param postMethodProxyRequest
	 * @param httpServletRequest
	 * void
	 */
	private void handleStandardPost(PostMethod postMethodProxyRequest, HttpServletRequest httpServletRequest) {
    	// Get the client POST data as a Map
		Map<String, String[]> mapPostParameters = (Map<String,String[]>) httpServletRequest.getParameterMap();
		// Create a List to hold the NameValuePairs to be passed to the PostMethod
		List<NameValuePair> listNameValuePairs = new ArrayList<NameValuePair>();
		// Iterate the parameter names
		for(String stringParameterName : mapPostParameters.keySet()) {
			// Iterate the values for each parameter name
			String[] stringArrayParameterValues = mapPostParameters.get(stringParameterName);
			for(String stringParamterValue : stringArrayParameterValues) {
				// Create a NameValuePair and store in list
				NameValuePair nameValuePair = new NameValuePair(stringParameterName, stringParamterValue);
				listNameValuePairs.add(nameValuePair);
			}
		}
		// Set the proxy request POST data 
		postMethodProxyRequest.setRequestBody(listNameValuePairs.toArray(new NameValuePair[] { }));
    }
    
    private void handlePost(PostMethod postMethodProxyRequest, HttpServletRequest httpServletRequest) {
    	try {
    		RequestEntity requestEntity = new InputStreamRequestEntity(httpServletRequest.getInputStream());
    		postMethodProxyRequest.setRequestEntity(requestEntity);
    	} catch (IOException e) {
    		// TODO Auto-generated catch block
    		e.printStackTrace();
    	}
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

		// Check if the proxy response is a redirect
		// The following code is adapted from org.tigris.noodle.filters.CheckForRedirect
		// Hooray for open source software
		if(intProxyResponseCode >= HttpServletResponse.SC_MULTIPLE_CHOICES /* 300 */
				&& intProxyResponseCode < HttpServletResponse.SC_NOT_MODIFIED /* 304 */) {
			String stringStatusCode = Integer.toString(intProxyResponseCode);
			String locationUrl = httpMethodProxyRequest.getResponseHeader(STRING_LOCATION_HEADER).getValue();
			if(locationUrl == null) {
					throw new ServletException("Recieved status code: " + stringStatusCode 
							+ " but no " +  STRING_LOCATION_HEADER + " header was found in the response");
			}
			String urlPath = "";
			if (locationUrl.startsWith("http")) {
				URL url = new URL(locationUrl);
				urlPath = url.getPath();
			}else{
				urlPath = locationUrl;
			}
			// Modify the redirect to go to this proxy servlet rather that the proxied host
			/*
			String localHostPath = httpServletRequest.getServerName();
			if(httpServletRequest.getServerPort() != 80) {
				localHostPath += ":" + httpServletRequest.getServerPort();
			}
			localHostPath += httpServletRequest.getContextPath() + getProxyPath();
			String proxyHostPath = getProxyHostAndPort() + getProxyPath();
			*/
			String localHostPath = httpServletRequest.getContextPath();
			String proxyHostPath = stringProxyPath;
			String redirectUrl = urlPath.replace(proxyHostPath, localHostPath + proxyHostPath);
			httpServletResponse.sendRedirect(redirectUrl);
			return;
		} else if(intProxyResponseCode == HttpServletResponse.SC_NOT_MODIFIED) {
			// 304 needs special handling.  See:
			// http://www.ics.uci.edu/pub/ietf/http/rfc1945.html#Code304
			// We get a 304 whenever passed an 'If-Modified-Since'
			// header and the data on disk has not changed; server
			// responds w/ a 304 saying I'm not going to send the
			// body because the file has not changed.
			httpServletResponse.setIntHeader(STRING_CONTENT_LENGTH_HEADER_NAME, 0);
			httpServletResponse.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
			return;
		}
		
		// Pass the response code back to the client
		httpServletResponse.setStatus(intProxyResponseCode);

        // Pass response headers back to the client
        Header[] headerArrayResponse = httpMethodProxyRequest.getResponseHeaders();
        for(Header header : headerArrayResponse) {
        	
        	String key = header.getName();
        	String value = header.getValue();
        	if("Transfer-Encoding".equals(key)){
        		//如果设置这个头，则浏览器不能获取返回内容
        		continue;
        	}
        	if("Set-Cookie".equals(key)){
        		//如果设置这个头，则浏览器不能获取返回内容
        		String cookiePath = String.format("Path=%s", stringProxyPath);
        		if(value.contains(cookiePath)){
        			String newCookiePath = String.format("Path=%s", httpServletRequest.getContextPath());
        			value = value.replace(cookiePath, newCookiePath);
        		}
        	}
        	//logger.info("set header [{}] : [{}]", key, value);
        	httpServletResponse.addHeader(key, value);
        }
        // Send the content to the client
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
        return "Jason's Proxy Servlet";
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
				// In case the proxy host is running multiple virtual servers,
				// rewrite the Host header to ensure that we get content from
				// the correct virtual server
				if(stringHeaderName.equalsIgnoreCase(STRING_HOST_HEADER_NAME)){
					stringHeaderValue = getProxyHostAndPort();
				}
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
		// Set the protocol to HTTP
		String stringProxyURL = "http://" + getProxyHostAndPort();
		// Check if we are proxying to a path other that the document root
		if(!stringProxyPath.equalsIgnoreCase("")){
			stringProxyURL += stringProxyPath;
		}
		// Handle the path given to the servlet
		String pathInfo = httpServletRequest.getPathInfo();
		if (pathInfo != null) {
			stringProxyURL += pathInfo;
		}
		// Handle the query string
		if(httpServletRequest.getQueryString() != null) {
			stringProxyURL += "?" + httpServletRequest.getQueryString();
		}
		return stringProxyURL;
    }
    
    /**
     * 
     * <p>Description:</p>
     *
     * @return
     * String
     */
    private String getProxyHostAndPort() {
    	if(intProxyPort == 80) {
    		return stringProxyHost;
    	} else {
    		return stringProxyHost + ":" + intProxyPort;
    	}
	}
}