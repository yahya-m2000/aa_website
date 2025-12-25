// Quick script to test if your Facebook token works
// Usage: node test-token.js YOUR_TOKEN_HERE

const token = process.argv[2];
const pageId = '732146899983117';

if (!token) {
  console.log('Usage: node test-token.js YOUR_TOKEN_HERE');
  process.exit(1);
}

async function testToken() {
  const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time&limit=3&access_token=${token}`;

  try {
    console.log('Testing token...\n');
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.log('❌ Token Error:');
      console.log(JSON.stringify(data.error, null, 2));
    } else if (data.data) {
      console.log('✅ Token works! Found', data.data.length, 'posts:');
      data.data.forEach((post, i) => {
        console.log(`\n${i + 1}. Post ID: ${post.id}`);
        console.log(`   Message: ${post.message?.substring(0, 50) || 'No message'}...`);
      });
      console.log('\n📝 This token is valid! Add it to your .env file as FACEBOOK_PAGE_ACCESS_TOKEN');
    } else {
      console.log('⚠️ Unexpected response:', data);
    }
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testToken();
