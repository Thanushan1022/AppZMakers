import SystemSettings from '../models/SystemSettings.js';

export const getSettings = async () => {
  let settings = await SystemSettings.findOne({ key: 'default' });
  if (!settings) {
    settings = await SystemSettings.create({ key: 'default' });
  }
  if (!settings.departments || settings.departments.length === 0) {
    settings.departments = [
      'Engineering',
      'Design',
      'Product',
      'Operations',
      'Analytics'
    ];
    await settings.save();
  }
  
  const o = settings.toObject();
  delete o.key;
  delete o._id;
  delete o.__v;
  delete o.createdAt;
  delete o.updatedAt;
  return o;
};

export const updateSettings = async (updates) => {
  const settings = await SystemSettings.findOneAndUpdate(
    { key: 'default' },
    { $set: updates },
    { new: true, upsert: true }
  );
  const o = settings.toObject();
  delete o.key;
  delete o._id;
  delete o.__v;
  delete o.createdAt;
  delete o.updatedAt;
  return o;
};
