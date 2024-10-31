import mongoose from 'mongoose';

const onboardingDataSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true
  },
  preferences: {
    companySize: String,
    budgetRange: String,
    projectType: String,
    communicationPreferences: [String],
    additionalRequirements: String,
    customFields: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const OnboardingData = mongoose.models.OnboardingData || mongoose.model('OnboardingData', onboardingDataSchema);

export default OnboardingData; 