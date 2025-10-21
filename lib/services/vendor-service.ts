import { z } from 'zod';
import { getDb } from '../db';
import { vendorFormSchema } from '../schemas';
import { uuid } from '../utils';
import { Vendor } from '../types';

type VendorFormInput = z.infer<typeof vendorFormSchema>;

export const listVendors = () => {
  const { vendors } = getDb();
  return vendors;
};

export const createVendor = (input: VendorFormInput) => {
  const parsed = vendorFormSchema.parse(input);
  const db = getDb();

  if (db.vendors.some((vendor) => vendor.name.toLowerCase() === parsed.name.toLowerCase())) {
    throw new Error('Vendor with this name already exists');
  }

  const vendor: Vendor = {
    id: uuid(),
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    category: parsed.category,
    rating: parsed.rating,
    address: parsed.address,
    taxId: parsed.taxId,
    attachments: parsed.attachments ?? [],
    isActive: true
  };

  db.vendors.unshift(vendor);
  return vendor;
};

export const updateVendor = (id: string, input: VendorFormInput) => {
  const parsed = vendorFormSchema.parse(input);
  const db = getDb();
  const vendor = db.vendors.find((item) => item.id === id);
  if (!vendor) {
    throw new Error('Vendor not found');
  }

  if (
    db.vendors.some(
      (item) => item.id !== id && item.name.toLowerCase() === parsed.name.toLowerCase()
    )
  ) {
    throw new Error('Vendor with this name already exists');
  }

  vendor.name = parsed.name;
  vendor.email = parsed.email;
  vendor.phone = parsed.phone;
  vendor.category = parsed.category;
  vendor.rating = parsed.rating;
  vendor.address = parsed.address;
  vendor.taxId = parsed.taxId;
  vendor.attachments = parsed.attachments ?? [];
  vendor.isActive = parsed.isActive ?? true;

  return vendor;
};

export const deleteVendor = (id: string) => {
  const db = getDb();
  const index = db.vendors.findIndex((vendor) => vendor.id === id);
  if (index === -1) {
    throw new Error('Vendor not found');
  }
  const [removed] = db.vendors.splice(index, 1);
  return removed;
};
