import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      default: 'Knowledge Institute of Technology',
    },
    campusAddress: {
      type: String,
      default: 'KIOT-Campus, NH544, Kakapalayam, Salem, Tamil Nadu – 637504',
    },
    allowedDomain: {
      type: String,
      default: 'kiot.ac.in',
    },
    enforceDomainRestriction: {
      type: Boolean,
      default: true,
    },
    allowDemoBypass: {
      type: Boolean,
      default: true,
    },
    registrationEnabled: {
      type: Boolean,
      default: true,
    },
    qrPresenceEnabled: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
