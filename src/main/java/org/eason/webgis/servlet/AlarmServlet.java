package org.eason.webgis.servlet;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;

import org.apache.commons.lang.math.RandomUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.Lists;


public class AlarmServlet extends HttpServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 3448456185208122460L;
	private final static Logger logger  = LoggerFactory.getLogger(AlarmServlet.class);
	
	
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
		
        ServletOutputStream sos = httpServletResponse.getOutputStream();
        
        sos.write(getAlarms().getBytes("UTF-8"));
        sos.close();
	}
	
	/**
	 * 
	 */
	public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
        	throws IOException, ServletException {
		
    }
	
	private static String getAlarms(){
		
        List<List<String>> alarms = Lists.newArrayList();
        ArrayList<String> ieds = Lists.newArrayList(StringUtils.split("TEMPLATE59,TEMPLATE180,TEMPLATE27", ","));
		ArrayList<String> alarmInfos = Lists.newArrayList(StringUtils.split(
				"电压越限,电压中断,闪变", ","));
 
        int count = RandomUtils.nextInt(2);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        for (int i = 0; i < count; i++) {
        	List<String> alarm = Lists.newArrayList();
        	alarm.add(ieds.get(RandomUtils.nextInt(ieds.size() -1)));
        	alarm.add(sdf.format(new Date()));
        	alarm.add(alarmInfos.get(RandomUtils.nextInt(alarmInfos.size() -1)));
        	alarms.add(alarm);
		}
        
        JSONArray jsonArray = JSONArray.fromObject( alarms );  
        String info  = jsonArray.toString();
		logger.info(info);
		return info;
	}
}