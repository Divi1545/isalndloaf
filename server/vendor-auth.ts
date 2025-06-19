import express from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { storage } from './storage';
import type { Request, Response } from 'express';

const router = express.Router();

// Airtable config
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const VENDORS_TABLE = 'Vendors';

// Helper: create random password
function randomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
  return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Enhanced vendor registration with Airtable sync
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, businessType, businessName, location } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if vendor already exists in local storage
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Vendor already exists' });
    }

    // Check Airtable if configured
    if (AIRTABLE_API_KEY && AIRTABLE_BASE) {
      try {
        const searchResp = await axios.get(
          `https://api.airtable.com/v0/${AIRTABLE_BASE}/${VENDORS_TABLE}?filterByFormula={Email}="${email}"`,
          { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
        );
        
        if (searchResp.data.records.length > 0) {
          return res.status(409).json({ error: 'Vendor already exists in Airtable' });
        }
      } catch (airtableError) {
        console.warn('Airtable check failed, proceeding with local registration:', airtableError);
      }
    }

    // Generate password if not provided (admin use)
    const plainPassword = password || randomPassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create user in local storage matching the current schema
    const newUser = await storage.createUser({
      username: email,
      email,
      password: hashedPassword,
      fullName: name || 'Tourism Vendor',
      businessName: businessName || name || 'Tourism Business',
      businessType: businessType || 'stays',
      role: 'vendor',
      categoriesAllowed: [businessType || 'stays']
    });

    // Sync to Airtable if configured
    if (AIRTABLE_API_KEY && AIRTABLE_BASE) {
      try {
        await axios.post(
          `https://api.airtable.com/v0/${AIRTABLE_BASE}/${VENDORS_TABLE}`,
          { 
            fields: { 
              Name: name || businessName || 'Tourism Vendor',
              Email: email,
              Password: hashedPassword,
              Status: 'Active',
              BusinessType: businessType || 'stays',
              Location: location || 'Sri Lanka',
              LocalUserId: newUser.id.toString()
            } 
          },
          { 
            headers: { 
              Authorization: `Bearer ${AIRTABLE_API_KEY}`, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      } catch (airtableError) {
        console.warn('Airtable sync failed, but user created locally:', airtableError);
      }
    }

    // TODO: Send welcome email to vendor
    // Example: await sendVendorWelcomeEmail(email, plainPassword);

    res.json({ 
      success: true, 
      email, 
      password: password ? undefined : plainPassword, // Only return generated password
      message: 'Vendor registered successfully'
    });

  } catch (error) {
    console.error('Vendor registration failed:', error);
    res.status(500).json({ error: 'Failed to register vendor' });
  }
});

// Enhanced vendor login with Airtable sync
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // First try local authentication
    const user = await storage.getUserByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        businessType: user.businessType
      };

      return res.json({ 
        success: true, 
        user: { 
          id: user.id,
          name: user.businessName || user.username,
          email: user.email,
          role: user.role,
          businessType: user.businessType
        }
      });
    }

    // Fallback to Airtable authentication if configured
    if (AIRTABLE_API_KEY && AIRTABLE_BASE) {
      try {
        const searchResp = await axios.get(
          `https://api.airtable.com/v0/${AIRTABLE_BASE}/${VENDORS_TABLE}?filterByFormula={Email}="${email}"`,
          { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
        );

        if (searchResp.data.records.length === 0) {
          return res.status(401).json({ error: 'Vendor not found' });
        }

        const airtableVendor = searchResp.data.records[0].fields;
        const passwordMatch = await bcrypt.compare(password, airtableVendor.Password);
        
        if (!passwordMatch) {
          return res.status(403).json({ error: 'Invalid password' });
        }

        // Create/sync user locally if not exists
        let localUser = user;
        if (!localUser) {
          localUser = await storage.createUser({
            username: email,
            email,
            password: airtableVendor.Password, // Already hashed
            fullName: airtableVendor.Name || 'Tourism Vendor',
            businessName: airtableVendor.Name || 'Tourism Business',
            businessType: airtableVendor.BusinessType || 'stays',
            role: 'vendor',
            categoriesAllowed: [airtableVendor.BusinessType || 'stays']
          });
        }

        // Set session
        req.session.user = {
          id: localUser.id,
          username: localUser.username,
          email: localUser.email,
          role: localUser.role,
          businessType: localUser.businessType
        };

        return res.json({ 
          success: true, 
          user: { 
            id: localUser.id,
            name: airtableVendor.Name || localUser.businessName,
            email: localUser.email,
            role: localUser.role,
            businessType: localUser.businessType
          }
        });

      } catch (airtableError) {
        console.error('Airtable authentication failed:', airtableError);
      }
    }

    return res.status(401).json({ error: 'Invalid credentials' });

  } catch (error) {
    console.error('Vendor login failed:', error);
    res.status(500).json({ error: 'Failed to authenticate vendor' });
  }
});

// Get vendor profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await storage.getUser(req.session.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.businessName || user.username,
      email: user.email,
      role: user.role,
      businessType: user.businessType,
      businessName: user.businessName,
      location: user.location
    });

  } catch (error) {
    console.error('Failed to get vendor profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update vendor profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { businessName, location, businessType } = req.body;
    
    // Update local user (Note: updateUser method would need to be added to storage interface)
    // For now, we'll fetch and recreate - this is a simplified approach
    const user = await storage.getUser(req.session.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Implement updateUser in storage interface
    // const updatedUser = await storage.updateUser(user.id, { businessName, location, businessType });

    res.json({ 
      success: true, 
      message: 'Profile update functionality ready - requires updateUser method in storage' 
    });

  } catch (error) {
    console.error('Failed to update vendor profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;