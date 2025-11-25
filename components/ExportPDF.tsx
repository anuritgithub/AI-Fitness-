'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function ExportPDF() {
  const [loading, setLoading] = useState(false);

  const exportToPDF = async () => {
    setLoading(true);
    try {
      console.log('Starting PDF export...');

      // Find the main fitness plan element
      const element = document.getElementById('fitness-plan');
      
      if (!element) {
        console.error('Element with id "fitness-plan" not found');
        alert('Error: Fitness plan not found. Please generate a plan first.');
        setLoading(false);
        return;
      }

      console.log('Found fitness-plan element');
      console.log('Element dimensions:', {
        offsetWidth: element.offsetWidth,
        scrollHeight: element.scrollHeight,
      });

      // Save original display settings
      const originalOverflow = element.style.overflow;
      const originalMaxHeight = element.style.maxHeight;

      // Temporarily adjust element to show all content
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';

      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = element.offsetWidth + 'px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.zIndex = '-1';

      // Clone the element
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.style.transform = 'scale(1)';
      clonedElement.style.margin = '0';
      clonedElement.style.padding = '20px';

      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      console.log('Converting HTML to canvas...');

      // Convert to canvas with proper settings
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: clonedElement.scrollHeight,
        windowWidth: clonedElement.offsetWidth || 1200,
        imageTimeout: 10000,
        ignoreElements: (element) => {
          // Ignore elements you don't want in PDF
          return false;
        },
      });

      console.log('Canvas created successfully');
      console.log('Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height,
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);
      
      // Restore original settings
      element.style.overflow = originalOverflow;
      element.style.maxHeight = originalMaxHeight;

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      console.log('Image data created');

      // Calculate PDF dimensions
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgWidth = pageWidth - 10; // Add 5mm margins on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log('PDF dimensions:', {
        pageWidth,
        pageHeight,
        imgWidth,
        imgHeight,
        totalPages: Math.ceil(imgHeight / pageHeight),
      });

      // Create PDF
      console.log('Creating PDF document...');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;
      const margin = 5; // 5mm margin

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      let pageNumber = 1;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pageNumber++;
        pdf.addImage(imgData, 'PNG', margin, margin + position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      console.log(`PDF created with ${pageNumber} page(s)`);

      // Save the PDF
      console.log('Saving PDF file...');
      pdf.save('AI-Fitness-Plan.pdf');
      
      console.log('PDF exported successfully!');
      alert('PDF downloaded successfully!\n\nCheck your Downloads folder.\n\n' + 
            `Total pages: ${pageNumber}`);
      
    } catch (error: any) {
      console.error( 'PDF Export Error:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
      alert(`Error: ${error?.message || 'Failed to export PDF. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={exportToPDF} 
      variant="outline"
      disabled={loading}
      className="gap-2 w-full sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
