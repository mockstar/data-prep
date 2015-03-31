package org.talend.dataprep.api.service.command;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;


class ReleasableInputStream extends InputStream {

    private static final Logger LOG = LoggerFactory.getLogger( ReleasableInputStream.class );

    private final InputStream delegate;

    private final Runnable onClose;

    public ReleasableInputStream(InputStream delegate, Runnable onClose) {
        this.delegate = delegate;
        this.onClose = onClose;
    }

    @Override
    public int read() throws IOException {
        try {
            int read = delegate.read();
            if (read < 0) {
                safeClose();
            }
            return read;
        } catch (IOException e) {
            safeClose();
            throw e;
        }
    }

    @Override
    public int read(byte[] bytes) throws IOException {
        try {
            int read = delegate.read(bytes);
            if (read < 0) {
                safeClose();
            }
            return read;
        } catch (IOException e) {
            safeClose();
            throw e;
        }
    }

    @Override
    public int read(byte[] bytes, int i, int i1) throws IOException {
        try {
            int read = delegate.read(bytes, i, i1);
            if (read < 0) {
                safeClose();
            }
            return read;
        } catch (IOException e) {
            safeClose();
            throw e;
        }
    }

    @Override
    public long skip(long l) throws IOException {
        try {
            return delegate.skip(l);
        } catch (IOException e) {
            safeClose();
            throw e;
        }
    }

    @Override
    public int available() throws IOException {
        try {
            return delegate.available();
        } catch (IOException e) {
            safeClose();
            throw e;
        }
    }

    @Override
    public void close() throws IOException {
        try {
            delegate.close();
        } finally {
            safeClose();
        }
    }

    private void safeClose() {
        try {
            LOG.debug("Safe close on stream using {}", onClose);

            onClose.run();
        } catch (Throwable t) {
            LOG.error("Unable to invoke onClose closure.", t);
        }
    }

    @Override
    public void mark(int i) {
        try {
            delegate.mark(i);
        } catch (RuntimeException e) {
            safeClose();
            throw e;
        }
    }

    @Override
    public void reset() throws IOException {
        try {
            delegate.reset();
        } catch (IOException e) {
            safeClose();
            throw e;
        }
    }

    @Override
    public boolean markSupported() {
        return delegate.markSupported();
    }
}
