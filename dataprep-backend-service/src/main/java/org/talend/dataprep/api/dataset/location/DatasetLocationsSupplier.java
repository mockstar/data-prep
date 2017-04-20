// ============================================================================
// Copyright (C) 2006-2016 Talend Inc. - www.talend.com
//
// This source code is available under agreement available at
// https://github.com/Talend/data-prep/blob/master/LICENSE
//
// You should have received a copy of the agreement
// along with this program; if not, write to Talend SA
// 9 rue Pages 92150 Suresnes, France
//
// ============================================================================

package org.talend.dataprep.api.dataset.location;

import java.util.Collection;

import org.talend.dataprep.api.dataset.DataSetLocation;

/**
 * Any component extending this will be identified as {@link DataSetLocation} supplier and will be able to provide
 * additional {@link DataSetLocation} in {@link DataSetLocationService}.
 */
public interface DatasetLocationsSupplier<T extends DataSetLocation> {

    Collection<T> getAvailableLocations();

}
