package org.talend.dataprep.dataset.configuration;

import org.jets3t.service.impl.rest.httpclient.RestS3Service;
import org.jets3t.service.security.AWSCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AWSConfiguration {

	@Value("${amazon.access.key:}")
	public String accessKey;
	
	@Value("${amazon.secret.key:}")
	public String accessSecret;
	
	@Value("${amazon.s3.suite.root:mockstar}")
	public String root;
	
	
	@Bean(name="aws-credentials") 
	public AWSCredentials getAWSCredentials() {
		return new AWSCredentials(accessKey, accessSecret);
	}
	
	@Bean(name="s3-service")
	public RestS3Service getS3Service() {
		return new RestS3Service(getAWSCredentials());
	}
	
}
