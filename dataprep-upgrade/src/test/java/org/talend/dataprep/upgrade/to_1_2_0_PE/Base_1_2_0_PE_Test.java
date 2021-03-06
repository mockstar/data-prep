// ============================================================================
//
// Copyright (C) 2006-2018 Talend Inc. - www.talend.com
//
// This source code is available under agreement available at
// https://github.com/Talend/data-prep/blob/master/LICENSE
//
// You should have received a copy of the agreement
// along with this program; if not, write to Talend SA
// 9 rue Pages 92150 Suresnes, France
//
// ============================================================================

package org.talend.dataprep.upgrade.to_1_2_0_PE;

import org.junit.BeforeClass;
import org.springframework.test.context.TestPropertySource;
import org.talend.dataprep.upgrade.BasePEUpgradeTest;

/**
 * Base class for all 1.2.0PE upgrade task tests.
 */
@TestPropertySource(locations = { "to_1_2_0_PE.properties" })
public abstract class Base_1_2_0_PE_Test extends BasePEUpgradeTest {

    /**
     * Copy the version to test store to another folder in order not to mess with git
     *
     * @throws Exception if an error occurs.
     */
    @BeforeClass
    public static void baseSetUp() throws Exception {
        setupStore("1.1.0-PE");
    }

    /**
     * @return the expected version.
     */
    @Override
    protected String getExpectedVersion() {
        return "1.2.0-PE";
    }
}
