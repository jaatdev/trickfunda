'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@cosmic/store/useStore';
import { PDFDocument } from 'pdf-lib';
import { savePdf } from '@cosmic/utils/storage';

export default function PDFUrlLoader() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get('pdfUrl');
  const { setDocument, setProjectName, clearCanvas } = useStore();

  useEffect(() => {
    if (!pdfUrl) return;

    let isMounted = true;

    async function loadRemotePdf() {
      try {
        // Try to extract a name from the URL early
        try {
          const urlObj = new URL(pdfUrl!);
          const parts = urlObj.pathname.split('/');
          const filename = parts[parts.length - 1];
          if (filename && filename.endsWith('.pdf')) {
            setProjectName(decodeURIComponent(filename.replace('.pdf', '')));
          } else {
            setProjectName('External PDF');
          }
        } catch (e) {
          setProjectName('External PDF');
        }

        const response = await fetch(pdfUrl!);
        if (!response.ok) throw new Error('Network response was not ok');
        const arrayBuffer = await response.arrayBuffer();
        
        // Parse with pdf-lib to get metadata
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();
        const firstPage = pdfDoc.getPage(0);
        const { width, height } = firstPage.getSize();
        
        if (isMounted) {
          // Save the PDF bytes to IndexedDB so export functionality works
          await savePdf(pdfUrl!, arrayBuffer);
          
          clearCanvas();
          // Pass the URL as documentId, along with metadata
          setDocument(pdfUrl!, totalPages, width, height);
        }
      } catch (error) {
        console.error('Failed to load remote PDF:', error);
      }
    }

    loadRemotePdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, setDocument, setProjectName, clearCanvas]);

  return null;
}
