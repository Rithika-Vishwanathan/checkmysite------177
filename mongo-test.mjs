import { connectDatabase } from './server/dist/db.js';
import { User } from './server/dist/models/User.js';

const firebaseUid = 'mongo_test_' + Date.now();
const email = 'mongo.test.' + Date.now() + '@example.com';

try {
  await connectDatabase();
  await User.deleteMany({ firebaseUid });
  const created = await User.create({ userId: firebaseUid, firebaseUid, email, name: 'Mongo Test', provider: 'mongo-test' });
  const found = await User.findOne({ firebaseUid });
  console.log('MONGO_WRITE_OK=' + String(Boolean(found && found.email === email)));
  const deleted = await User.deleteOne({ firebaseUid });
  console.log('MONGO_DELETE_OK=' + String(Boolean(deleted.deletedCount)));
  const after = await User.findOne({ firebaseUid });
  console.log('MONGO_READ_AFTER_DELETE=' + (after ? 'present' : 'absent'));
  console.log('MONGO_TEST_RECORD_ID=' + String(created._id));
  const mongoose = (await import('mongoose')).default;
  await mongoose.disconnect();
} catch (error) {
  const msg = error && error.message ? error.message : String(error);
  console.error('MONGO_TEST_FAIL=' + msg);
  process.exit(1);
}
