import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface ReceiptData {
  receiptNumber: string;
  donorName: string;
  donorPAN: string;
  donorAddress?: string;
  ngoName: string;
  ngo80GRegNo: string;
  donationDescription: string;
  donationValue: number;
  issueDate: Date;
  financialYear: string;
}

interface DonationReceiptData {
  receiptNumber: string;
  donorName: string;
  donorPAN: string;
  ngoName: string;
  ngo80GRegNo: string;
  amount: number;
  transactionId: string;
  donationDate: Date;
  financialYear: string;
}

export const generateTaxReceipt = async (data: ReceiptData): Promise<string> => {
  const uploadsDir = path.join(__dirname, '../../uploads/receipts');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `receipt-${data.receiptNumber}.pdf`;
  const filepath = path.join(uploadsDir, filename);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('80G Donation Receipt', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text('(Under Section 80G of Income Tax Act, 1961)', { align: 'center' });
      doc.moveDown(2);

      // Receipt Details
      doc.fontSize(12).font('Helvetica-Bold').text(`Receipt No: ${data.receiptNumber}`);
      doc.fontSize(10).font('Helvetica').text(`Date: ${data.issueDate.toLocaleDateString('en-IN')}`);
      doc.text(`Financial Year: ${data.financialYear}`);
      doc.moveDown(1.5);

      // NGO Details
      doc.fontSize(12).font('Helvetica-Bold').text('Issued By:');
      doc.fontSize(10).font('Helvetica').text(data.ngoName);
      doc.text(`80G Registration No: ${data.ngo80GRegNo}`);
      doc.moveDown(1.5);

      // Donor Details
      doc.fontSize(12).font('Helvetica-Bold').text('Donor Details:');
      doc.fontSize(10).font('Helvetica').text(`Name: ${data.donorName}`);
      doc.text(`PAN: ${data.donorPAN}`);
      if (data.donorAddress) {
        doc.text(`Address: ${data.donorAddress}`);
      }
      doc.moveDown(1.5);

      // Donation Details
      doc.fontSize(12).font('Helvetica-Bold').text('Donation Details:');
      doc.fontSize(10).font('Helvetica').text(`Description: ${data.donationDescription}`);
      doc.text(`Estimated Value: ₹${data.donationValue.toFixed(2)}`);
      doc.moveDown(2);

      // Certificate Text
      doc.fontSize(10).font('Helvetica-Oblique')
        .text('This is to certify that the above donation has been received with thanks.', { align: 'justify' });
      doc.text('This receipt is eligible for tax deduction under Section 80G of the Income Tax Act, 1961.', { align: 'justify' });
      doc.moveDown(3);

      // Footer
      doc.fontSize(8).font('Helvetica')
        .text('This is a computer-generated receipt and does not require a physical signature.', { align: 'center' });
      doc.text('For queries, please contact the NGO directly.', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        console.log(`✅ PDF generated successfully: ${filepath}`);
        resolve(filepath);
      });
      
      stream.on('error', (err) => {
        console.error('❌ PDF generation error:', err);
        reject(err);
      });
    } catch (error) {
      console.error('❌ PDF creation error:', error);
      reject(error);
    }
  });
};

export const generateDonationReceipt = async (data: DonationReceiptData): Promise<string> => {
  const uploadsDir = path.join(__dirname, '../../uploads/receipts/monetary');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `receipt-${data.receiptNumber}.pdf`;
  const filepath = path.join(uploadsDir, filename);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('80G DONATION RECEIPT', { align: 'center' });
      doc.fontSize(10).font('Helvetica-Oblique').text('(Monetary Donation)', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text('(Under Section 80G of Income Tax Act, 1961)', { align: 'center' });
      doc.moveDown(2);

      // Receipt Details
      doc.fontSize(12).font('Helvetica-Bold').text(`Receipt No: ${data.receiptNumber}`);
      doc.fontSize(10).font('Helvetica').text(`Date: ${data.donationDate.toLocaleDateString('en-IN')}`);
      doc.text(`Transaction ID: ${data.transactionId}`);
      doc.text(`Financial Year: ${data.financialYear}`);
      doc.moveDown(1.5);

      // NGO Details
      doc.fontSize(12).font('Helvetica-Bold').text('Issued By:');
      doc.fontSize(10).font('Helvetica').text(data.ngoName);
      doc.text(`80G Registration No: ${data.ngo80GRegNo}`);
      doc.moveDown(1.5);

      // Donor Details
      doc.fontSize(12).font('Helvetica-Bold').text('Donor Details:');
      doc.fontSize(10).font('Helvetica').text(`Name: ${data.donorName}`);
      doc.text(`PAN: ${data.donorPAN}`);
      doc.moveDown(1.5);

      // Donation Amount
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#2563eb').text(`Amount Donated: ₹${data.amount.toLocaleString('en-IN')}`, { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown(2);

      // Certificate Text
      doc.fontSize(10).font('Helvetica-Oblique')
        .text('This is to certify that the above monetary donation has been received with thanks.', { align: 'justify' });
      doc.text('This receipt is eligible for tax deduction under Section 80G of the Income Tax Act, 1961.', { align: 'justify' });
      doc.text('Please retain this receipt for tax filing purposes.', { align: 'justify' });
      doc.moveDown(3);

      // Footer
      doc.fontSize(8).font('Helvetica')
        .text('This is a computer-generated receipt and does not require a physical signature.', { align: 'center' });
      doc.text('For queries, please contact the NGO directly.', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        console.log(`✅ Monetary donation receipt generated: ${filepath}`);
        resolve(filepath);
      });
      
      stream.on('error', reject);
    } catch (error) {
      console.error('❌ PDF creation error:', error);
      reject(error);
    }
  });
};

export const getFinancialYear = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month < 3) { // Jan, Feb, Mar
    return `${year - 1}-${year}`;
  } else {
    return `${year}-${year + 1}`;
  }
};

export const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `80G-${timestamp}-${random}`;
};
