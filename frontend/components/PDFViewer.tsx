import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { storage, auth } from '@/lib/firebase';

interface PDFDocument {
  name: string;
  url: string;
  size?: number;
}

interface PDFViewerProps {
  storagePath?: string;
}

export default function PDFViewer({ storagePath = '' }: PDFViewerProps) {
  const [user, authLoading] = useAuthState(auth);
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Remove selectedPdf state since we'll show all PDFs

  useEffect(() => {
    const fetchPDFs = async () => {
      // Wait for auth to complete
      if (authLoading) return;
      
      // If storage rules require auth and user is not logged in
      if (!user) {
        setError('Please log in to view documents');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const storageRef = ref(storage, storagePath);
        const result = await listAll(storageRef);
        
        // Filter for PDF files only
        const pdfItems = result.items.filter(item => item.name.toLowerCase().endsWith('.pdf'));
        
        const pdfPromises = pdfItems.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            url: url,
          };
        });

        const pdfDocuments = await Promise.all(pdfPromises);
        setPdfs(pdfDocuments);
      } catch (err: any) {
        console.error('Error fetching PDFs:', err);
        if (err.code === 'storage/unauthorized') {
          setError('Access denied. Please check Firebase Storage security rules.');
        } else {
          setError(`Failed to load PDF documents: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPDFs();
  }, [storagePath, user, authLoading]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress sx={{ color: '#006e34' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        {error}
      </Alert>
    );
  }

  if (pdfs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', padding: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No PDF documents found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Title */}
      <Typography variant="h5" sx={{ mb: 3, color: '#006e34', fontWeight: 'bold' }}>
        From our Children, with your help...
      </Typography>

      {/* PDF Grid - 2 columns */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 3,
          height: '100%',
          maxHeight: '75vh',
        }}
      >
        {pdfs.map((pdf, index) => (
          <Box 
            key={pdf.name}
            sx={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >

            
            {/* PDF Viewer - A4 Proportions */}
            <Box 
              sx={{ 
                flex: 1, 
                width: '100%',
                aspectRatio: '210/297', // A4 aspect ratio (width/height)
                maxHeight: 'calc(75vh - 120px)', // Account for title and spacing
              }}
            >
              <iframe
                src={`${pdf.url}#zoom=fit&scrollbar=0&toolbar=0&navpanes=0&view=FitH`}
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                }}
                title={pdf.name}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
} 