package org.eason.webgis.filter;

import java.io.IOException;
import java.net.SocketTimeoutException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eason.webgis.utils.HttpClientUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class ExceptionFilter implements Filter {
	
	private final static Logger logger  = LoggerFactory.getLogger(ExceptionFilter.class);
	
	public void init(FilterConfig config) throws ServletException {
		
	}
	
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		
		try {
			chain.doFilter(request, response);
		} catch (SocketTimeoutException e){
			HttpClientUtil.handleError404((HttpServletRequest)request, (HttpServletResponse)response);
			logger.error("exception : [{}]", e);
		} catch (IOException e){
			HttpClientUtil.handleError404((HttpServletRequest)request, (HttpServletResponse)response);
			logger.error("exception : [{}]", e);
		}
	}

	public void destroy() {
		
	}


}
