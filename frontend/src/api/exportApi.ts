import { apiClient } from './client';

const triggerBlobDownload = (data: BlobPart, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getFilenameFromHeader = (contentDisposition: string | undefined, defaultFilename: string): string => {
  if (!contentDisposition) return defaultFilename;
  const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
  if (matches != null && matches[1]) {
    return matches[1].replace(/['"]/g, '');
  }
  return defaultFilename;
};

const handleExportError = async (error: any) => {
  if (error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const parsed = JSON.parse(text);
      if (parsed.detail) {
        throw new Error(typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail));
      }
    } catch (e: any) {
      if (e.message && e.message !== error.message) throw e;
    }
  }
  throw error;
};

export const exportApi = {
  downloadPdf: async (reportId: string, customFilename?: string) => {
    try {
      const response = await apiClient.get(`/export/pdf/${reportId}`, {
        responseType: 'blob',
      });
      const filename = customFilename || getFilenameFromHeader(
        response.headers['content-disposition'],
        `HelixQ_Report_${reportId.slice(0, 8)}.md`
      );
      triggerBlobDownload(response.data, filename, 'text/markdown');
    } catch (err) {
      await handleExportError(err);
    }
  },

  downloadCsv: async (reportId: string, customFilename?: string) => {
    try {
      const response = await apiClient.get(`/export/csv/${reportId}`, {
        responseType: 'blob',
      });
      const filename = customFilename || getFilenameFromHeader(
        response.headers['content-disposition'],
        `HelixQ_Candidates_${reportId.slice(0, 8)}.csv`
      );
      triggerBlobDownload(response.data, filename, 'text/csv');
    } catch (err) {
      await handleExportError(err);
    }
  },

  downloadJson: async (reportId: string, customFilename?: string) => {
    try {
      const response = await apiClient.get(`/export/json/${reportId}`, {
        responseType: 'blob',
      });
      const filename = customFilename || getFilenameFromHeader(
        response.headers['content-disposition'],
        `HelixQ_Payload_${reportId.slice(0, 8)}.json`
      );
      triggerBlobDownload(response.data, filename, 'application/json');
    } catch (err) {
      await handleExportError(err);
    }
  },

  downloadDatasetCsv: async (datasetId: string, datasetName?: string) => {
    try {
      const response = await apiClient.get(`/export/csv/dataset/${datasetId}`, {
        responseType: 'blob',
      });
      const filename = datasetName
        ? `${datasetName.replace(/[^a-zA-Z0-9]/g, '_')}_compounds.csv`
        : getFilenameFromHeader(
            response.headers['content-disposition'],
            `Dataset_${datasetId.slice(0, 8)}_compounds.csv`
          );
      triggerBlobDownload(response.data, filename, 'text/csv');
    } catch (err) {
      await handleExportError(err);
    }
  }
};
