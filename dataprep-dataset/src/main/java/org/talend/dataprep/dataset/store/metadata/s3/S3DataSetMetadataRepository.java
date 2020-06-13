package org.talend.dataprep.dataset.store.metadata.s3;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Stream;

import javax.annotation.PostConstruct;

import org.jets3t.service.S3ServiceException;
import org.jets3t.service.ServiceException;
import org.jets3t.service.StorageObjectsChunk;
import org.jets3t.service.impl.rest.httpclient.RestS3Service;
import org.jets3t.service.model.S3Bucket;
import org.jets3t.service.model.S3Object;
import org.jets3t.service.model.StorageObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.talend.daikon.exception.ExceptionContext;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.dataset.store.metadata.ObjectDataSetMetadataRepository;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.exception.error.DataSetErrorCodes;
import org.talend.dataprep.util.ReentrantReadWriteLockGroup;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * In memory implementation of the DataSetMetadataRepository.
 */
@Component
@ConditionalOnProperty(name = "dataset.metadata.store", havingValue = "s3")
public class S3DataSetMetadataRepository extends ObjectDataSetMetadataRepository {

	/** This class' logger. */
    private static final Logger LOG = LoggerFactory.getLogger(S3DataSetMetadataRepository.class);
	
    /**
     * A group of ReentrantReadWriteLock associating to each dataset id a unique ReentrantReadWriteLock.
     */
    private final ReentrantReadWriteLockGroup locks = new ReentrantReadWriteLockGroup(true, 100);
    
    /** The dataprep ready jackson builder. */
    @Autowired
    private ObjectMapper mapper;
    
	@Value("${dataset.metadata.store.s3.location}")
	public String root;
	
	public S3Bucket parent;

	@Autowired
	private RestS3Service s3Service;

	@PostConstruct
    private void init() {
        try {
            // work out the modular bucket
        	// starts with modular-metadata.*
        	List<S3Bucket> buckets = Arrays.asList(s3Service.listAllBuckets());
        	for(final S3Bucket bucket : buckets) {
        		if(bucket.getName().startsWith(root)) {
        			parent = bucket;
        			break;
        		}
        	}
        } catch (S3ServiceException e) {
            throw new IllegalStateException("unable to create dataset metadata store folder", e);
        }
    }
    
	@Override
	public void save(DataSetMetadata metadata) {
		String id = metadata.getId();

        ReentrantReadWriteLock lock = locks.getLock(id);
        
        lock.writeLock().lock();
        try {
        	final S3Object file = new S3Object(id, mapper.writeValueAsString(metadata));
        	s3Service.putObject(parent, file);
        } catch (IOException | NoSuchAlgorithmException | S3ServiceException e) {
            LOG.error("Error saving {}", metadata, e);
            throw new TDPException(DataSetErrorCodes.UNABLE_TO_STORE_DATASET_METADATA, e,  ExceptionContext.build().put("id", metadata.getId()));
		} finally {
            lock.writeLock().unlock();
        }
	}

	@Override
	public DataSetMetadata get(String id) {
        S3Object file = null;
        
        try {
        	file = s3Service.getObject(parent.getName(), id);
        } catch (S3ServiceException e) {
        	LOG.error("unable to load dataset {}", id, e);
            return null;
		} 
        
        ReentrantReadWriteLock lock = locks.getLock(id);

        lock.readLock().lock();
        try (BufferedReader reader = new BufferedReader(
        	    new InputStreamReader(file.getDataInputStream()))) {
            return mapper.readerFor(DataSetMetadata.class).readValue(reader);
        } catch (IOException | ServiceException e) {
            LOG.error("unable to load dataset {}", id, e);
            return null;
        } finally {
            lock.readLock().unlock();
        }
	}

	@Override
	public void remove(String id) {
		try {
			s3Service.deleteObject(parent.getName(), id);
	        LOG.debug("metadata {} successfully deleted", id);
		} catch (ServiceException e) {
			LOG.error("unable to remove dataset {}", id, e);
		}
	}

	@Override
	protected Stream<DataSetMetadata> source() {
		List<DataSetMetadata> values = new ArrayList<DataSetMetadata>();
		StorageObjectsChunk chunk;
		try {
			chunk = s3Service.listObjectsChunked(parent.getName(), "", "/", Integer.MAX_VALUE, null, true);
			for(StorageObject object : chunk.getObjects()) {
				if(object.isDirectoryPlaceholder()) {
				} else {
					values.add(get(object.getKey()));
				}
			}
		} 
		catch (ServiceException e) {
			LOG.error("unable to list items {}", e);
		}
		return values.stream();
	}

    
}
