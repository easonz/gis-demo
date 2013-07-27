package org.eason.webgis.utils;

import java.io.IOException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.params.HttpClientParams;

public class HttpClientUtil {

	public static final String STRING_CONTENT_TYPE_HEADER_NAME = "Content-Type";
	public static final String STRING_CONTENT_LENGTH_HEADER_NAME = "Content-Length";
	public static final int REQUEST_TIMEOUT = 10*1000;//设置请求超时10秒钟  
	public static final int SO_TIMEOUT = 10*1000;  //设置等待数据超时时间10秒钟
	
	public static HttpClient getHttpClient(){
    	HttpClientParams httpParams = new HttpClientParams();
    	httpParams.setConnectionManagerTimeout(REQUEST_TIMEOUT);
    	httpParams.setSoTimeout(SO_TIMEOUT);
    	HttpClient httpClient = new HttpClient(httpParams);
    	return httpClient;
	}
	
    /**
     * 
     * <p>Description:</p>
     *
     * @param httpServletRequest
     * @param httpServletResponse
     * @throws IOException
     * void
     */
    public static void handleError404(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException {
    	httpServletResponse.setStatus(404);
    	httpServletResponse.setHeader(STRING_CONTENT_TYPE_HEADER_NAME, "text/plain");
		ServletOutputStream sos = httpServletResponse.getOutputStream();
		sos.write("page not found.".getBytes());
		sos.close();
    }
    
    /**
     * 
     * <p>Description:</p>
     *
     * @param httpServletRequest
     * @param httpServletResponse
     * @throws IOException
     * void
     */
    public static void handleError502(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException {
    	httpServletResponse.setStatus(502);
    	httpServletResponse.setHeader(STRING_CONTENT_TYPE_HEADER_NAME, "text/plain");
    	ServletOutputStream sos = httpServletResponse.getOutputStream();
    	sos.write("Status: 502 Bad Gateway".getBytes());
    	sos.close();
    }
	
}
