import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    locality: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  bhk: { type: String, required: true }, // '1BHK' | '2BHK' etc.
  price: { type: Number, required: true },
  propertyType: { type: String, required: true }, // 'Apartment', 'Villa', etc.
  builtUpArea: { type: Number, required: true },
  furnishing: { type: String, required: true },
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }], // Cloudinary URLs
  floor: { type: Number, required: true },
  age: { type: String, required: true },
  facing: { type: String, required: true },
  amenities: [{ type: String, required: true }],
  ownerContact: { type: String, required: true },
  postedByAdmin: { type: Boolean, default: true }, // To distinguish commercial posts
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' }
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
PropertySchema.index({ 'location.coordinates': '2dsphere' });

// Create a text index for searching
PropertySchema.index({ title: 'text', 'location.address': 'text', 'location.locality': 'text', projectName: 'text' });


// Pre-save middleware to ensure coordinates are set
PropertySchema.pre('save', function(next) {
  if (this.isModified('location.lat') || this.isModified('location.lng')) {
    if (this.location.lat && this.location.lng) {
      this.location.coordinates = {
        type: 'Point',
        coordinates: [this.location.lng, this.location.lat] // GeoJSON uses [longitude, latitude] order
      };
    }
  }
  next();
});

export default mongoose.models.Property || mongoose.model('Property', PropertySchema);
