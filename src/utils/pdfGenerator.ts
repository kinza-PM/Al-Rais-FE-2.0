import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGenerationOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  backgroundColor?: string;
}

/**
 * Generates a PDF from an HTML element and downloads it
 * @param elementId - The ID of the HTML element to convert to PDF
 * @param options - Configuration options for PDF generation
 */
export const generatePDFFromElement = async (
  elementId: string,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    filename = 'flight-ticket.pdf',
    quality = 0.98,
    scale = 2,
    backgroundColor = '#ffffff'
  } = options;

  try {
    // Get the element to convert
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Hide elements with pdf-hide class
    const elementsToHide = element.querySelectorAll('.pdf-hide');
    const originalDisplayValues: string[] = [];

    elementsToHide.forEach((el) => {
      const htmlEl = el as HTMLElement;
      originalDisplayValues.push(htmlEl.style.display);
      htmlEl.style.display = 'none';
    });

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: backgroundColor,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Restore original display values
    elementsToHide.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = originalDisplayValues[index];
    });

    // Calculate dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Create PDF with appropriate dimensions
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'px',
      format: [imgWidth, imgHeight]
    });

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', quality);

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Generates a PDF from multiple elements (each becomes a separate page)
 * @param elementSelectors - Array of CSS selectors for elements to include as pages
 * @param containerId - ID of the container holding the elements
 * @param filename - Name of the PDF file
 * @param options - PDF generation options
 */
export const generateMultiPagePDF = async (
  elementSelectors: string[],
  containerId: string,
  filename: string,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    quality = 0.98,
    scale = 2,
    backgroundColor = '#ffffff',
  } = options;

  // Find the container that holds printable content
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with id "${containerId}" not found`);
  }

  // Create a temporary visible container for PDF generation
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '580px';
  tempContainer.style.visibility = 'hidden';
  tempContainer.style.pointerEvents = 'none';
  tempContainer.id = 'temp-pdf-container';

  // Clone the content from the container
  const clonedContent = container.cloneNode(true) as HTMLElement;
  clonedContent.style.position = 'relative';
  clonedContent.style.left = '0';
  clonedContent.style.top = '0';
  clonedContent.style.visibility = 'visible';
  clonedContent.style.display = 'block';

  tempContainer.appendChild(clonedContent);
  document.body.appendChild(tempContainer);

  try {
    // Find all specified elements in the cloned content
    const elements: HTMLElement[] = [];
    for (const selector of elementSelectors) {
      const element = clonedContent.querySelector(selector) as HTMLElement | null;
      if (element) {
        elements.push(element);
      }
    }

    if (elements.length === 0) {
      throw new Error('No printable elements found with the provided selectors');
    }

    // Helper to render a single element to canvas
    const renderElementToCanvas = async (el: HTMLElement) => {
      // Hide elements marked as pdf-hide inside the specific element
      const elementsToHide = el.querySelectorAll('.pdf-hide');
      elementsToHide.forEach((node) => {
        const htmlEl = node as HTMLElement;
        htmlEl.style.display = 'none';
      });

      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor,
        logging: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
        removeContainer: true,
        foreignObjectRendering: false,
      });

      return canvas;
    };

    // Render each element to canvas
    const canvases: HTMLCanvasElement[] = [];
    for (const element of elements) {
      const canvas = await renderElementToCanvas(element);
      canvases.push(canvas);
    }

    if (canvases.length === 0) {
      throw new Error('Failed to render any element for PDF');
    }

    // Create PDF using first page size
    const first = canvases[0];
    const firstWidth = first.width;
    const firstHeight = first.height;
    const pdf = new jsPDF({
      orientation: firstHeight > firstWidth ? 'portrait' : 'landscape',
      unit: 'px',
      format: [firstWidth, firstHeight],
    });

    // Add first page
    pdf.addImage(first.toDataURL('image/png', quality), 'PNG', 0, 0, firstWidth, firstHeight);

    // Add remaining pages
    for (let i = 1; i < canvases.length; i++) {
      const c = canvases[i];
      const w = c.width;
      const h = c.height;
      // Create a new page sized to the canvas
      pdf.addPage([w, h], h > w ? 'portrait' : 'landscape');
      pdf.addImage(c.toDataURL('image/png', quality), 'PNG', 0, 0, w, h);
    }

    // Save
    pdf.save(filename);
  } finally {
    // Clean up the temporary container
    if (tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};

/**
 * Generates a PDF from a single element
 * @param elementSelector - CSS selector for the element to convert
 * @param containerId - ID of the container holding the element
 * @param filename - Name of the PDF file
 * @param options - PDF generation options
 */
export const generateSinglePagePDF = async (
  elementSelector: string,
  containerId: string,
  filename: string,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  // const name = `${filename}.pdf`;
  // await generatePDFFromElement(
  //   'flight-ticket-pdf',
  //   { filename: name, ...options }
  // );
  await generateMultiPagePDF([elementSelector], containerId, filename, options);
};

/**
 * Generates a PDF from the flight ticket component (backward compatibility)
 * @param bookingRef - Booking reference for filename
 * @param options - Additional PDF generation options
 */
export const generateFlightTicketPDF = async (
  bookingRef: string,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const filename = `flight-ticket-${bookingRef || 'booking'}.pdf`;

  await generateMultiPagePDF(
    ['#flight-ticket-content', '#flight-instructions-content'],
    'flight-ticket-pdf',
    filename,
    options
  );
};
