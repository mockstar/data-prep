package org.talend.dataprep.api.dataset.json;

import java.io.InputStream;

import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.DataSetMetadata;

import com.fasterxml.jackson.core.Version;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.module.SimpleModule;

@Component
public class DataSetMetadataModule extends SimpleModule {

    public static final Module DEFAULT = new DataSetMetadataModule();

    public static SimpleModule get(boolean metadata, boolean columns, InputStream records) {
        return new DataSetMetadataModule(metadata, columns, records);
    }

    public DataSetMetadataModule() {
        super(DataSetMetadata.class.getName(), new Version(1, 0, 0, null, null, null));
        addDeserializer(DataSetMetadata.class, new DataSetMetadataJsonDeserializer());
        addSerializer(DataSetMetadata.class, new DataSetMetadataJsonSerializer(true, true, null));
    }

    private DataSetMetadataModule(boolean metadata, boolean columns, InputStream records) {
        super(DataSetMetadata.class.getName(), new Version(1, 0, 0, null, null, null));
        addDeserializer(DataSetMetadata.class, new DataSetMetadataJsonDeserializer());
        addSerializer(DataSetMetadata.class, new DataSetMetadataJsonSerializer(metadata, columns, records));
    }

}
