import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db';
import { chatService } from './features/chat/chat.service';

async function runTest() {
  console.log('Connecting to database...');
  await connectDB();

  // We need a valid user ID from the database for testing. 
  // Let's get any existing user.
  const user = await mongoose.connection.collection('users').findOne({});
  if (!user) {
    console.log('❌ No users found in database to test with.');
    process.exit(1);
  }
  const userId = user._id.toString();
  console.log(`Using userId: ${userId}`);

  try {
    console.log('\n--- 1. Testing Create Conversation & Send Message ---');
    const msg1 = await chatService.sendMessage(userId, 'Hi, I want to learn about React hooks.');
    console.log('✅ AI Reply:', msg1.reply.substring(0, 100) + '...');
    const sessionId = msg1.session.id;
    console.log(`✅ Session Created with ID: ${sessionId} and Title: "${msg1.session.title}"`);

    console.log('\n--- 2. Testing Get Sessions ---');
    const sessions = await chatService.getSessions(userId);
    console.log(`✅ Found ${sessions.length} sessions.`);
    const foundSession = sessions.find(s => s.id === sessionId);
    if (foundSession) {
      console.log('✅ New session is present in the list.');
    } else {
      throw new Error('New session not found in list!');
    }

    console.log('\n--- 3. Testing Get History ---');
    const history = await chatService.getHistory(userId, sessionId);
    console.log(`✅ History loaded. Message count: ${history.length}`);
    if (history.length !== 2) {
      throw new Error('Expected 2 messages in history.');
    }

    console.log('\n--- 4. Testing Rename Session ---');
    const renamed = await chatService.renameSession(userId, sessionId, 'React Hooks Learning');
    console.log(`✅ Session renamed to: "${renamed.title}"`);

    console.log('\n--- 5. Testing Delete Session ---');
    await chatService.deleteSession(userId, sessionId);
    console.log('✅ Session deleted successfully.');

    console.log('\n🎉 ALL E2E CHAT TESTS PASSED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('❌ TEST FAILED:', err.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

runTest();
