// Test script to diagnose fetch issue
const testText = 'Today I woke up early and had a wonderful breakfast with my family. The weather was beautiful and sunny. I decided to go for a walk in the park near my house. There were many people enjoying the nice day. Some were jogging while others were having picnics on the grass. I met an old friend from school and we talked for about thirty minutes. It was great to catch up with her after such a long time. In the afternoon I worked on some personal projects at home. I am learning to play the guitar and practiced for an hour. For dinner I cooked pasta with vegetables which turned out delicious. After dinner I watched a movie with my roommate. We chose a comedy that made us laugh a lot. Before going to bed I read a few chapters of an interesting book I recently started. Overall it was a very peaceful and productive day that I really enjoyed.';

// Test 1: Check word count
const wordCount = testText.trim().split(/\s+/).filter(word => word.length > 0).length;
console.log('Test 1 - Word Count:', wordCount, '(should be between 100-1000)');

// Test 2: Test API endpoint
const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';
console.log('Test 2 - API URL:', API_URL);

async function testAPI() {
  try {
    console.log('\nTest 3 - Testing /health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    console.log('\nTest 4 - Testing /api/evaluate endpoint...');
    const evaluateResponse = await fetch(`${API_URL}/api/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: testText }),
    });

    if (!evaluateResponse.ok) {
      const errorData = await evaluateResponse.json();
      console.error('❌ Evaluation failed:', errorData);
      return;
    }

    const result = await evaluateResponse.json();
    console.log('✅ Evaluation successful!');
    console.log('Overall level:', result.overall.level);
    console.log('Attributes:', Object.keys(result.attributes));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

testAPI();
