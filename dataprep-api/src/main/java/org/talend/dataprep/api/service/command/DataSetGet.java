package org.talend.dataprep.api.service.command;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.TimeUnit;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.APIMessages;
import org.talend.dataprep.api.service.PreparationAPI;
import org.talend.dataprep.exception.Exceptions;

import com.netflix.hystrix.HystrixCommand;

@Component
@Scope("request")
public class DataSetGet extends HystrixCommand<InputStream> {

    @Value("${http.retry.pause}")
    public int PAUSE;

    @Value("${http.retry.max_retry}")
    private int MAX_RETRY;

    private static final Logger LOGGER = LoggerFactory.getLogger(DataSetGet.class);

    private final HttpClient client;

    private final String dataSetId;

    private final HttpGet contentRetrieval;

    private int retryCount = 0;

    private DataSetGet(HttpClient client, String contentServiceUrl, String dataSetId, boolean metadata, boolean columns) {
        super(PreparationAPI.TRANSFORM_GROUP);
        this.client = client;
        this.dataSetId = dataSetId;
        contentRetrieval = new HttpGet(contentServiceUrl + "/" + dataSetId + "/content/?metadata=" + metadata + "&columns="
                + columns);
    }

    @Override
    protected InputStream run() throws Exception {
        HttpResponse response = client.execute(contentRetrieval);
        return handleResponse(response);
    }

    private InputStream handleResponse(HttpResponse response) throws IOException {
        int statusCode = response.getStatusLine().getStatusCode();
        if (statusCode >= 200) {
            if (statusCode == HttpStatus.SC_NO_CONTENT) {
                // Immediately release connection
                contentRetrieval.releaseConnection();
                return new ByteArrayInputStream(new byte[0]);
            } else if (statusCode == HttpStatus.SC_ACCEPTED) {
                // Data set exists, but content isn't yet analyzed, retry request
                retryCount++;
                if (retryCount > MAX_RETRY) {
                    LOGGER.error("Failed to retrieve data set content after {} tries.", retryCount);
                    throw Exceptions.User(APIMessages.UNABLE_TO_RETRIEVE_DATASET_CONTENT);
                }
                // Pause before retry
                final int pauseTime = PAUSE * retryCount;
                LOGGER.info("Data set #{} content is not ready, pausing for {} ms.", dataSetId, pauseTime);
                try {
                    TimeUnit.MILLISECONDS.sleep(pauseTime);
                } catch (InterruptedException e) {
                    throw Exceptions.User(APIMessages.UNABLE_TO_RETRIEVE_DATASET_CONTENT, e);
                }
                return handleResponse(client.execute(contentRetrieval));
            } else if (statusCode == HttpStatus.SC_OK) {
                return new ReleasableInputStream(response.getEntity().getContent(), contentRetrieval::releaseConnection);
            }
        }
        throw Exceptions.User(APIMessages.UNABLE_TO_RETRIEVE_DATASET_CONTENT);
    }
}
