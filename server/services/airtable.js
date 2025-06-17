import Airtable from 'airtable';
import { logger } from '../middleware/logging.js';

// Initialize Airtable with your credentials
if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set');
}

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

class AirtableService {
  // Vendors Management
  async getVendors() {
    try {
      const records = await base('Vendors').select().all();
      return records.map(record => ({
        id: record.fields['Vendor ID'],
        name: record.fields['Name'],
        category: record.fields['Category'],
        instagram: record.fields['Instagram'],
        commissionRate: record.fields['Commission Rate'],
        location: record.fields['Location'],
        airtableId: record.id
      }));
    } catch (error) {
      logger.error('Failed to fetch vendors from Airtable:', error);
      throw error;
    }
  }

  async createVendor(vendorData) {
    try {
      const record = await base('Vendors').create([{
        fields: {
          'Vendor ID': vendorData.vendorId || `V${Date.now()}`,
          'Name': vendorData.name,
          'Category': vendorData.category,
          'Instagram': vendorData.instagram || '',
          'Commission Rate': vendorData.commissionRate || '10%',
          'Location': vendorData.location
        }
      }]);

      logger.info('Vendor created in Airtable:', { vendorId: vendorData.vendorId });
      return record[0];
    } catch (error) {
      logger.error('Failed to create vendor in Airtable:', error);
      throw error;
    }
  }

  async updateVendor(vendorId, updateData) {
    try {
      // Find the record by Vendor ID
      const records = await base('Vendors')
        .select({
          filterByFormula: `{Vendor ID} = '${vendorId}'`
        })
        .all();

      if (records.length === 0) {
        throw new Error(`Vendor ${vendorId} not found`);
      }

      const updated = await base('Vendors').update(records[0].id, updateData);
      logger.info('Vendor updated in Airtable:', { vendorId });
      return updated;
    } catch (error) {
      logger.error('Failed to update vendor in Airtable:', error);
      throw error;
    }
  }

  // Bookings Management
  async getBookings() {
    try {
      const records = await base('Bookings').select().all();
      return records.map(record => ({
        id: record.fields['Booking ID'],
        vendorId: record.fields['Vendor ID'],
        customerName: record.fields['Customer Name'],
        email: record.fields['Email'],
        guests: record.fields['Guests'],
        checkIn: record.fields['Check-in'],
        checkOut: record.fields['Check-out'],
        status: record.fields['Status'],
        airtableId: record.id
      }));
    } catch (error) {
      logger.error('Failed to fetch bookings from Airtable:', error);
      throw error;
    }
  }

  async createBooking(bookingData) {
    try {
      const record = await base('Bookings').create([{
        fields: {
          'Booking ID': bookingData.bookingId || `B${Date.now()}`,
          'Vendor ID': bookingData.vendorId,
          'Customer Name': bookingData.customerName,
          'Email': bookingData.customerEmail,
          'Guests': bookingData.guests || 1,
          'Check-in': bookingData.checkIn,
          'Check-out': bookingData.checkOut,
          'Status': bookingData.status || 'Pending'
        }
      }]);

      logger.info('Booking created in Airtable:', { bookingId: bookingData.bookingId });
      return record[0];
    } catch (error) {
      logger.error('Failed to create booking in Airtable:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId, status) {
    try {
      const records = await base('Bookings')
        .select({
          filterByFormula: `{Booking ID} = '${bookingId}'`
        })
        .all();

      if (records.length === 0) {
        throw new Error(`Booking ${bookingId} not found`);
      }

      const updated = await base('Bookings').update(records[0].id, {
        'Status': status
      });

      logger.info('Booking status updated in Airtable:', { bookingId, status });
      return updated;
    } catch (error) {
      logger.error('Failed to update booking status in Airtable:', error);
      throw error;
    }
  }

  // Payments Management
  async getPayments() {
    try {
      const records = await base('Payments').select().all();
      return records.map(record => ({
        id: record.fields['Payment ID'],
        bookingId: record.fields['Booking ID'],
        vendorId: record.fields['Vendor ID'],
        amount: record.fields['Amount'],
        status: record.fields['Status'],
        dueDate: record.fields['Due Date'],
        airtableId: record.id
      }));
    } catch (error) {
      logger.error('Failed to fetch payments from Airtable:', error);
      throw error;
    }
  }

  async createPayment(paymentData) {
    try {
      const record = await base('Payments').create([{
        fields: {
          'Payment ID': paymentData.paymentId || `P${Date.now()}`,
          'Booking ID': paymentData.bookingId,
          'Vendor ID': paymentData.vendorId,
          'Amount': paymentData.amount,
          'Status': paymentData.status || 'Pending',
          'Due Date': paymentData.dueDate
        }
      }]);

      logger.info('Payment created in Airtable:', { paymentId: paymentData.paymentId });
      return record[0];
    } catch (error) {
      logger.error('Failed to create payment in Airtable:', error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId, status) {
    try {
      const records = await base('Payments')
        .select({
          filterByFormula: `{Payment ID} = '${paymentId}'`
        })
        .all();

      if (records.length === 0) {
        throw new Error(`Payment ${paymentId} not found`);
      }

      const updated = await base('Payments').update(records[0].id, {
        'Status': status
      });

      logger.info('Payment status updated in Airtable:', { paymentId, status });
      return updated;
    } catch (error) {
      logger.error('Failed to update payment status in Airtable:', error);
      throw error;
    }
  }

  // Daily Reports Management
  async getDailyReports(startDate, endDate) {
    try {
      let formula = '';
      if (startDate && endDate) {
        formula = `AND({Report Date} >= '${startDate}', {Report Date} <= '${endDate}')`;
      } else if (startDate) {
        formula = `{Report Date} >= '${startDate}'`;
      }

      const records = await base('DailyReports')
        .select({
          filterByFormula: formula,
          sort: [{ field: 'Report Date', direction: 'desc' }]
        })
        .all();

      return records.map(record => ({
        date: record.fields['Report Date'],
        totalBookings: record.fields['Total Bookings'],
        totalRevenue: record.fields['Total Revenue'],
        newVendors: record.fields['New Vendors'],
        cancelledBookings: record.fields['Cancelled Bookings'],
        airtableId: record.id
      }));
    } catch (error) {
      logger.error('Failed to fetch daily reports from Airtable:', error);
      throw error;
    }
  }

  async createDailyReport(reportData) {
    try {
      const record = await base('DailyReports').create([{
        fields: {
          'Report Date': reportData.date,
          'Total Bookings': reportData.totalBookings || 0,
          'Total Revenue': reportData.totalRevenue || 0,
          'New Vendors': reportData.newVendors || 0,
          'Cancelled Bookings': reportData.cancelledBookings || 0
        }
      }]);

      logger.info('Daily report created in Airtable:', { date: reportData.date });
      return record[0];
    } catch (error) {
      logger.error('Failed to create daily report in Airtable:', error);
      throw error;
    }
  }

  // Agent Training Data Management
  async logAgentTraining(trainingData) {
    try {
      // Create Agent Training table entry if it doesn't exist
      const record = await base('AgentTraining').create([{
        fields: {
          'Training ID': trainingData.trainingId || `T${Date.now()}`,
          'Agent Type': trainingData.agent,
          'Input Example': trainingData.input,
          'Expected Output': trainingData.expectedOutput,
          'Context': trainingData.context || '',
          'Status': 'Processed',
          'Date': new Date().toISOString().split('T')[0]
        }
      }]);

      logger.info('Agent training logged in Airtable:', { trainingId: trainingData.trainingId });
      return record[0];
    } catch (error) {
      logger.error('Failed to log agent training in Airtable:', error);
      throw error;
    }
  }

  // System Logs Management
  async logSystemEvent(eventData) {
    try {
      const record = await base('SystemLogs').create([{
        fields: {
          'Log ID': eventData.logId || `L${Date.now()}`,
          'Timestamp': new Date().toISOString(),
          'Event Type': eventData.eventType,
          'Agent': eventData.agent || '',
          'Action': eventData.action || '',
          'Data': JSON.stringify(eventData.data || {}),
          'Status': eventData.status || 'Success',
          'Response Time': eventData.responseTime || 0
        }
      }]);

      return record[0];
    } catch (error) {
      logger.error('Failed to log system event in Airtable:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getVendorAnalytics(vendorId) {
    try {
      // Get bookings for vendor
      const bookings = await base('Bookings')
        .select({
          filterByFormula: `{Vendor ID} = '${vendorId}'`
        })
        .all();

      // Get payments for vendor
      const payments = await base('Payments')
        .select({
          filterByFormula: `{Vendor ID} = '${vendorId}'`
        })
        .all();

      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(b => b.fields['Status'] === 'Confirmed').length;
      const totalRevenue = payments.reduce((sum, p) => sum + (p.fields['Amount'] || 0), 0);
      const paidPayments = payments.filter(p => p.fields['Status'] === 'Paid').length;

      return {
        vendorId,
        totalBookings,
        confirmedBookings,
        conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings * 100).toFixed(2) : 0,
        totalRevenue,
        paidPayments,
        paymentRate: payments.length > 0 ? (paidPayments / payments.length * 100).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Failed to get vendor analytics from Airtable:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      // First, try to list the base metadata to check permissions
      const metadata = await base.table('Vendors').select({ maxRecords: 1 }).firstPage();
      logger.info('Airtable connection successful');
      return { 
        success: true, 
        message: 'Connection successful', 
        recordCount: metadata.length,
        tableAccess: 'Vendors table accessible'
      };
    } catch (error) {
      logger.error('Airtable connection failed:', error);
      
      // Provide detailed error information
      if (error.statusCode === 403) {
        return { 
          success: false, 
          message: 'Permission denied - API token needs proper scopes',
          error: 'NOT_AUTHORIZED',
          details: 'Token requires: data.records:read, data.records:write, schema.bases:read permissions'
        };
      } else if (error.statusCode === 404) {
        return { 
          success: false, 
          message: 'Base or table not found',
          error: 'NOT_FOUND',
          details: 'Check base ID and table names'
        };
      } else {
        return { 
          success: false, 
          message: error.message,
          error: error.error || 'UNKNOWN_ERROR'
        };
      }
    }
  }
}

export default new AirtableService();